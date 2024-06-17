"use client";

import { useMemo, useRef, useState } from "react";
import { initWasm } from "@resvg/resvg-wasm";
import { GitActivityItem } from "../core/types";
import { converToPng } from "../core/tools";
import {
  formatBaseData,
  formatShortSummary,
  formatSummary,
} from "../core/formatters";
import { loadGithubActivity, loadGitlabActivity } from "../core/loaders";
import { GITHUB_COLORS, GITLAB_COLORS } from "../core/constants";
import { FullTable } from "../components/full-table";
import { ShortTable } from "../components/short-table";

const HomePage = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [status, setStatus] = useState<"not_started" | "generating" | "ready">(
    "not_started"
  );
  const [gitlabActivity, setGitlabActivity] = useState<GitActivityItem>({});
  const [githubActivity, setGithubActivity] = useState<GitActivityItem>({});
  const wasmInitedRef = useRef(false);
  const baseData = useMemo(formatBaseData, []);

  const getGitlabActivity = async (username: string) => {
    const userGitlabActivity = await loadGitlabActivity(
      username,
      baseData.startDate
    );
    if (userGitlabActivity) {
      setGitlabActivity(userGitlabActivity);
    }
  };

  const getGithubActivity = async (username: string) => {
    const userGithubActivity = await loadGithubActivity(
      username,
      baseData.startDate
    );
    if (userGithubActivity) {
      setGithubActivity(userGithubActivity);
    }
  };

  const generateAction = async (formData: FormData) => {
    setStatus("generating");
    Promise.all([
      getGitlabActivity(formData.get("gitlab") as string),
      getGithubActivity(formData.get("github") as string),
    ]).then(() => {
      setStatus("ready");
    });
  };

  const shortSummary = useMemo(() => {
    return formatShortSummary(
      githubActivity,
      gitlabActivity,
      baseData.totalWeeks,
      baseData.startDate
    );
  }, [githubActivity, gitlabActivity, baseData.totalWeeks, baseData.startDate]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between flex-col lg:flex-row-reverse gap-8 mb-8">
        <div className="flex gap-4 justify-end">
          <a
            href="https://github.com/vordgi/dev-chart"
            className="max-sm:flex-1 text-center border-2 border-neutral-500 rounded-md px-4 py-2 text-neutral-950 hover:border-neutral-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 inline align-text-top"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span className="inline-block">Star me</span>
          </a>
          <a
            href="https://x.com/vordgi"
            className="max-sm:flex-1 text-center border-2 border-neutral-500 rounded-md px-4 py-2 text-neutral-950 hover:border-neutral-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 inline align-text-top"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
            <span className="inline-block">Follow author</span>
          </a>
        </div>
        <form className="flex max-md:flex-col gap-5" action={generateAction}>
          <div className="flex max-md:flex-col gap-2">
            <input
              name="github"
              placeholder="Github username"
              className="border rounded-md py-2 px-4 border-neutral-400 enabled:hover:border-neutral-800"
              required
            />
            <input
              name="gitlab"
              placeholder="Gitlab username"
              className="border rounded-md py-2 px-4 border-neutral-400 enabled:hover:border-neutral-800"
              required
            />
          </div>
          <button
            className="max-lg:flex-1 bg-blue-600 rounded-md px-4 py-2 text-neutral-50 enabled:hover:bg-blue-800 disabled:bg-neutral-600"
            disabled={status === "generating"}
            type="submit"
          >
            Generate
          </button>
        </form>
      </div>
      <FullTable
        githubActivity={githubActivity}
        gitlabActivity={gitlabActivity}
        totalWeeks={baseData.totalWeeks}
        ready={status === "ready"}
      />
      <span className="w-full h-0.5 my-6 bg-neutral-400 block" />
      <ShortTable
        githubActivity={githubActivity}
        gitlabActivity={gitlabActivity}
        totalWeeks={baseData.totalWeeks}
        startDate={baseData.startDate}
        ready={status === "ready"}
      />
    </div>
  );
};

export default HomePage;
