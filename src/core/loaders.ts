import { GitActivityItem } from "./types";

export const loadGithubActivity = async (username: string, startDate: Date) => {
  try {
    const userPageResp = await fetch(`/github/${username}`);
    const userPage = await userPageResp.text();
    const tooltips = userPage.match(
      // @ts-ignore
      /<tool-tip[^>]+for="contribution-day-component-[0-9]+-[0-9]+"[^>]*>([0-9]+)?/g
    );
    const tds =
      userPage.match(
        // @ts-ignore
        /<td[^>]+data-date="[^"]+" id="contribution-day-component-[0-9]+-[0-9]+"[^>]*>/g
      ) || [];
    const activityDates = tds.reduce<{ [id: string]: Date }>((acc, td) => {
      const match = td.match(
        // @ts-ignore
        /data-date="(?<date>[^"]+)" id="contribution-day-component-(?<id>[0-9]+-[0-9]+)"/
      );
      if (match?.groups) {
        acc[match.groups.id] = new Date(match.groups.date);
      }
      return acc;
    }, {});

    const rowsFormatted = tooltips?.reduce<GitActivityItem>((acc, row) => {
      const rowData = row.match(
        // @ts-ignore
        /day-component-(?<id>[0-9]+-[0-9]+)"[^>]*>(?<contribs>[0-9]+)?/
      );
      if (rowData?.groups) {
        const { id, contribs } = rowData?.groups;
        const date = activityDates[id];
        if (date) {
          const activityWeek = Math.floor(
            (date.getTime() - startDate.getTime() + 1) / (7 * 24 * 3600 * 1000)
          );
          acc[`${activityWeek}_${date.getDay()}`] = {
            count: +contribs,
            date: date.toDateString(),
          };
        }
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
          (date.getTime() - startDate.getTime()) / (7 * 24 * 3600 * 1000)
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
