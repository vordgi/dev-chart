"use client";

import { useMemo, useRef, useState } from "react";
import { initWasm } from "@resvg/resvg-wasm";
import { GitActivityItem } from "../core/types";
import {
  formatBaseData,
  formatPng,
  formatSummary,
  loadGithubActivity,
  loadGitlabActivity,
} from "../core/tools";
import { GITHUB_COLORS, GITLAB_COLORS } from "../core/constants";

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

  const summary = useMemo(() => {
    return formatSummary(githubActivity, gitlabActivity, baseData.totalWeeks);
  }, [githubActivity, gitlabActivity, baseData.totalWeeks]);

  const generateAction = async (formData: FormData) => {
    setStatus("generating");
    Promise.all([
      getGitlabActivity(formData.get("gitlab") as string),
      getGithubActivity(formData.get("github") as string),
    ]).then(() => {
      setStatus("ready");
    });
  };

  const copyPngHandler = async () => {
    if (!wasmInitedRef.current) {
      wasmInitedRef.current = true;
      await initWasm(
        fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm")
      );
    }

    if (svgRef.current?.outerHTML) {
      const pngBuffer = await formatPng(svgRef.current.outerHTML);
      if (pngBuffer) {
        navigator.clipboard.write([
          new ClipboardItem({
            "image/png": new Blob([pngBuffer], { type: "image/png" }),
          }),
        ]);
        alert("PNG copied");
        return;
      }
    }
    alert("Can't copy PNG");
  };
  const copySvgHandler = async () => {
    if (svgRef.current?.outerHTML) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([svgRef.current?.outerHTML], {
            type: "text/plain",
          }),
        }),
      ]);

      alert("SVG copied");
      return;
    }
    alert("Can't copy SVG");
  };

  return (
    <div className="container mx-auto px-4 my-6">
      <form className="flex max-md:flex-col gap-5 mb-8" action={generateAction}>
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
      <div className="border">
        <svg
          width="100%"
          viewBox={`0 0 ${baseData.totalWeeks * 14 + 4} 138`}
          xmlns="http://www.w3.org/2000/svg"
          ref={svgRef}
        >
          <g>
            {summary.items.map((item) => (
              <rect
                key={`${item.day}_${item.week}_${item.top}`}
                width="12"
                height={item.height}
                x={item.week * 14 + 4}
                y={item.day * 14 + item.top + 4}
                fill={item.fill}
              >
                {item.date && item.contribs && (
                  <title>
                    {`${item.contribs} contributions in ${
                      item.type === "gitlab" ? "Gitlab" : "Github"
                    } on ${item.date}`}
                  </title>
                )}
              </rect>
            ))}
          </g>
          {summary.totalGithubActivity >= 0 && (
            <g>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={GITHUB_COLORS[3]}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                y="106"
                x="4"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              {GITHUB_COLORS.map((color, i) => (
                <rect
                  key={color}
                  width="10"
                  height="10"
                  x={i * 12 + 36}
                  y="106"
                  fill={color}
                >
                  <title>{`${i ? i * 10 : 1}${
                    i === 3 ? "+" : `-${(i + 1) * 10 - 1}`
                  }`}</title>
                </rect>
              ))}
              <text y="132" x="36" fontWeight={600} fontSize="16">
                {summary.totalGithubActivity}
              </text>
            </g>
          )}
          {summary.totalGitlabActivity >= 0 && (
            <g>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke={GITLAB_COLORS[3]}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                y="106"
                x="104"
              >
                <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z" />
              </svg>
              {GITLAB_COLORS.map((color, i) => (
                <rect
                  key={color}
                  width="10"
                  height="10"
                  x={i * 12 + 136}
                  y="106"
                  fill={color}
                >
                  <title>
                    {`${i ? i * 10 : 1}${
                      i === 3 ? "+" : `-${(i + 1) * 10 - 1}`
                    }`}
                  </title>
                </rect>
              ))}
              <text y="132" x="136" fontWeight={600} fontSize="16">
                {summary.totalGitlabActivity}
              </text>
            </g>
          )}
          <text
            y="132"
            x={baseData.totalWeeks * 14}
            fontSize="10"
            textAnchor="end"
            fill="#6b7280"
          >
            dev-chart.nimpl.tech
          </text>
        </svg>
      </div>
      {status === "ready" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={copyPngHandler}
            className="max-sm:flex-1 border-2 border-blue-500 rounded-md px-4 py-2 text-neutral-950 enabled:hover:border-blue-800"
          >
            Copy as PNG
          </button>
          <button
            onClick={copySvgHandler}
            className="max-sm:flex-1 border-2 border-blue-500 rounded-md px-4 py-2 text-neutral-950 enabled:hover:border-blue-800"
          >
            Copy as SVG
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
