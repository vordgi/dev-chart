import { GitActivityItem } from "./types";

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
        acc[`${+week - 1}_${day}`] = {
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
