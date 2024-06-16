export type GitActivityItem = {
  [key: string]: {
    count: number;
    date: string;
  };
};

export type ActivityItem = {
  week: number;
  day: number;
  fill: string;
  height: number;
  top: number;
  type: "gitlab" | "github" | "none";
  contribs?: number;
  date?: string;
};
