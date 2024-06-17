import { ActivityItem, GitActivityItem } from "./types";
import { GITHUB_COLORS, GITLAB_COLORS } from "./constants";
import { getDateAfterWeeks, getWeekEndDate, getWeekStartDate } from "./tools";

export const formatBaseData = () => {
  const endDate = new Date();
  const startDate = new Date(new Date().setFullYear(endDate.getFullYear() - 1));
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const totalWeeks = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (7 * 24 * 3600 * 1000)
  );
  return { endDate, startDate, totalWeeks };
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

export const formatShortSummary = (
  githubActivity: GitActivityItem,
  gitlabActivity: GitActivityItem,
  weeks: number,
  startDate: Date
) => {
  const items: Omit<ActivityItem, "day">[] = [];
  let totalGithubActivity = 0;
  let totalGitlabActivity = 0;
  for (let w = 0; w < weeks; w++) {
    const weekStartDate = getWeekStartDate(
      getDateAfterWeeks(startDate, w + 1)
    ).toDateString();
    const weekEndDate = getWeekEndDate(
      getDateAfterWeeks(startDate, w + 1)
    ).toDateString();
    let weekGithubActivity = 0;
    let weekGitlabActivity = 0;
    for (let d = 0; d < 7; d++) {
      const githubItem = githubActivity[`${w}_${d}`];
      const gitlabItem = gitlabActivity[`${w}_${d}`];
      weekGithubActivity += githubItem?.count || 0;
      weekGitlabActivity += gitlabItem?.count || 0;
    }
    if (weekGithubActivity) {
      totalGithubActivity += weekGithubActivity;
      items.push({
        week: w,
        height: weekGitlabActivity ? 6 : 12,
        top: 0,
        contribs: weekGithubActivity,
        type: "github",
        date: `${weekStartDate} - ${weekEndDate}`,
        fill:
          GITHUB_COLORS[Math.floor(weekGithubActivity / 50)] ||
          GITHUB_COLORS[3],
      });
    }
    if (weekGitlabActivity) {
      totalGitlabActivity += weekGitlabActivity;
      items.push({
        week: w,
        height: weekGithubActivity ? 6 : 12,
        top: weekGithubActivity ? 6 : 0,
        contribs: weekGitlabActivity,
        type: "gitlab",
        date: `${weekStartDate} - ${weekEndDate}`,
        fill:
          GITLAB_COLORS[Math.floor(weekGitlabActivity / 50)] ||
          GITLAB_COLORS[3],
      });
    }
    if (!weekGithubActivity && !weekGitlabActivity) {
      items.push({
        week: w,
        fill: "#d1d5db",
        height: 12,
        top: 0,
        type: "none",
      });
    }
  }
  return { items, totalGithubActivity, totalGitlabActivity };
};
