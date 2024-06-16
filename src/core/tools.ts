import { Resvg, ResvgRenderOptions } from "@resvg/resvg-wasm";
import { ActivityItem, GitActivityItem } from "./types";
import { GITHUB_COLORS, GITLAB_COLORS } from "./constants";

export const formatPng = async (content: string) => {
  const font = await fetch("/GeistVF.woff2");
  if (!font.ok) return;

  const fontData = await font.arrayBuffer();
  const buffer = new Uint8Array(fontData);

  const opts: ResvgRenderOptions = {
    fitTo: {
      mode: "width",
      value: 1600,
    },
    font: {
      fontBuffers: [buffer],
    },
  };

  const resvgJS = new Resvg(content, opts);
  const pngData = resvgJS.render();
  const pngBuffer = pngData.asPng();
  return pngBuffer;
};

export const loadGithubActivity = async (username: string, startDate: Date) => {
  try {
    const userPageResp = await fetch(`/github/${username}`);
    const userPage = await userPageResp.text();
    const userActivityTable = userPage.match(
      /<table[^>]+ContributionCalendar-grid[^>]+>([\s\S](?!<\/table>))+[\s\S]<\/table>/g
    );
    const rows = userActivityTable?.[0].match(
      // @ts-ignore
      /<tool-tip[^>]+for="contribution-day-component[^>]+>([0-9]+)?/g
    );

    const rowsFormatted = rows?.reduce<GitActivityItem>((acc, row) => {
      const rowData = row.match(
        // @ts-ignore
        /day-component-(?<day>[0-9])+-(?<week>[0-9]+)"[^>]*>(?<contribs>[0-9]+)?/
      );
      if (rowData?.groups) {
        const { day, week, contribs } = rowData?.groups;
        const itemDate = new Date(startDate);
        itemDate.setDate(itemDate.getDate() + 7 * +week + +day);
        acc[`${week}_${day}`] = {
          count: +contribs,
          date: itemDate.toDateString(),
        };
      }
      return acc;
    }, {});
    return rowsFormatted || {};
  } catch {
    alert(`Can't load Github activity for "${username}"`);
  }
};

export const loadGitlabActivity = async (username: string, startDate: Date) => {
  try {
    const acitivitiesResp = await fetch(`/gitlab/${username}`);
    const acitivities: { [key: string]: number } = await acitivitiesResp.json();

    const result = Object.entries(acitivities).reduce<GitActivityItem>(
      (acc, [dateRaw, contribs]) => {
        const date = new Date(dateRaw);
        const activityWeek = Math.floor(
          (date.getTime() - startDate.getTime()) / (7 * 24 * 3600 * 1000) - 1
        );
        acc[`${activityWeek}_${date.getDay()}`] = {
          count: contribs,
          date: date.toDateString(),
        };
        return acc;
      },
      {}
    );
    return result;
  } catch {
    alert(`Can't load Gitlab activity for "${username}"`);
  }
};

export const formatBaseData = () => {
  const endDate = new Date();
  const startDate = new Date(new Date().setFullYear(endDate.getFullYear() - 1));
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const startDay = startDate.getDay();
  const totalWeeks = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (7 * 24 * 3600 * 1000)
  );
  return { endDate, startDate, startDay, totalWeeks };
};

export const formatSummary = (
  githubActivity: GitActivityItem,
  gitlabActivity: GitActivityItem,
  weeks: number
) => {
  const items: ActivityItem[] = [];
  let totalGithubActivity = 0;
  let totalGitlabActivity = 0;
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const gitlabItem = gitlabActivity[`${w}_${d}`];
      const githubItem = githubActivity[`${w}_${d}`];
      if (githubItem?.count) {
        totalGithubActivity += githubItem.count;
        items.push({
          week: w,
          day: d,
          height: gitlabItem?.count ? 6 : 12,
          top: 0,
          contribs: githubItem.count,
          date: githubItem.date,
          type: "github",
          fill:
            GITHUB_COLORS[Math.floor(githubItem.count / 10)] ||
            GITHUB_COLORS[3],
        });
      }
      if (gitlabItem?.count) {
        totalGitlabActivity += gitlabItem.count;
        items.push({
          week: w,
          day: d,
          height: githubItem?.count ? 6 : 12,
          top: githubItem?.count ? 6 : 0,
          contribs: gitlabItem.count,
          date: gitlabItem.date,
          type: "gitlab",
          fill:
            GITLAB_COLORS[Math.floor(gitlabItem.count / 10)] ||
            GITLAB_COLORS[3],
        });
      }
      if (!githubItem?.count && !gitlabItem?.count) {
        items.push({
          week: w,
          day: d,
          fill: "#d1d5db",
          height: 12,
          top: 0,
          type: "none",
        });
      }
    }
  }
  return { items, totalGithubActivity, totalGitlabActivity };
};
