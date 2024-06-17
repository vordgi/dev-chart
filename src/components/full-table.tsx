"use client";

import { useEffect, useMemo, useRef } from "react";
import { GITHUB_COLORS, GITLAB_COLORS } from "../core/constants";
import { copyPngToClipboard, copySvgToClipboard } from "../core/tools";
import { formatSummary } from "../core/formatters";
import { GitActivityItem } from "../core/types";

interface FullTableProps {
  totalWeeks: number;
  githubActivity: GitActivityItem;
  gitlabActivity: GitActivityItem;
  ready: boolean;
}

export const FullTable: React.FC<FullTableProps> = ({
  totalWeeks,
  githubActivity,
  gitlabActivity,
  ready,
}) => {
  const githubActivityRef = useRef<SVGTextElement>(null);
  const gitlabActivityRef = useRef<SVGTextElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const copyPngHandler = async () => {
    if (svgRef.current?.outerHTML) {
      try {
        await copyPngToClipboard(svgRef.current.outerHTML);
        return alert("PNG copied");
      } catch (e) {
        console.error(e);
      }
    }
    alert("Can't copy PNG");
  };
  const copySvgHandler = async () => {
    if (svgRef.current?.outerHTML) {
      try {
        await copySvgToClipboard(svgRef.current.outerHTML);
        return alert("SVG copied");
      } catch (e) {
        console.error(e);
      }
    }
    alert("Can't copy SVG");
  };
  const summary = useMemo(() => {
    return formatSummary(githubActivity, gitlabActivity, totalWeeks);
  }, [githubActivity, gitlabActivity, totalWeeks]);

  useEffect(() => {
    if (gitlabActivityRef.current && githubActivityRef.current) {
      gitlabActivityRef.current.setAttribute(
        "transform",
        `translate(${Math.max(
          githubActivityRef.current.getBBox().width - 76,
          0
        )})`
      );
    }
  }, [summary.totalGithubActivity]);

  return (
    <>
      <div className="border">
        <svg
          width="100%"
          viewBox={`0 0 ${totalWeeks * 14 + 6} 148`}
          xmlns="http://www.w3.org/2000/svg"
          ref={svgRef}
        >
          <rect width="100%" height="100%" fill="#ffffff" />
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
            <g ref={githubActivityRef}>
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
                y="116"
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
                  y="116"
                  fill={color}
                >
                  <title>
                    {`${i ? i * 10 : 1}${
                      i === 3 ? "+" : `-${(i + 1) * 10 - 1}`
                    }`}
                  </title>
                </rect>
              ))}
              <text y="142" x="36" fontWeight={600} fontSize="16">
                {summary.totalGithubActivity}
              </text>
            </g>
          )}
          {summary.totalGitlabActivity >= 0 && (
            <g ref={gitlabActivityRef}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke={GITLAB_COLORS[3]}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                y="116"
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
                  y="116"
                  fill={color}
                >
                  <title>
                    {`${i ? i * 10 : 1}${
                      i === 3 ? "+" : `-${(i + 1) * 10 - 1}`
                    }`}
                  </title>
                </rect>
              ))}
              <text y="142" x="136" fontWeight={600} fontSize="16">
                {summary.totalGitlabActivity}
              </text>
            </g>
          )}
          <a
            href="https://dev-chart.nimpl.tech/"
            target="_blank"
            rel="nooneper noreferrer"
          >
            <text
              y="142"
              x={totalWeeks * 14 + 2}
              fontSize="10"
              textAnchor="end"
              fill="#6b7280"
            >
              dev-chart.nimpl.tech
            </text>
          </a>
        </svg>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={copyPngHandler}
          className="max-sm:flex-1 border-2 border-blue-500 rounded-md px-4 py-2 text-neutral-950 enabled:hover:border-blue-800 disabled:bg-neutral-300 disabled:border-neutral-500"
          disabled={!ready}
        >
          Copy as PNG
        </button>
        <button
          onClick={copySvgHandler}
          className="max-sm:flex-1 border-2 border-blue-500 rounded-md px-4 py-2 text-neutral-950 enabled:hover:border-blue-800 disabled:bg-neutral-300 disabled:border-neutral-500"
          disabled={!ready}
        >
          Copy as SVG
        </button>
      </div>
    </>
  );
};
