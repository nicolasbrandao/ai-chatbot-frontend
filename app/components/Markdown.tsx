"use client";
import React, { ReactNode } from "react";
import MarkdownTOJSX from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ClipboardIcon } from "@heroicons/react/24/outline";

export type MarkdownProps = { markdown?: string };

const CodeBlock = ({ children }: { children: string }) => (
  <code
    onClick={() => navigator.clipboard.writeText(children)}
    className="bg-neutral text-info p-1 rounded"
  >
    {children}
  </code>
);

interface PreBlockProps {
  children: ReactNode | string;
}

const PreBlock = ({ children }: PreBlockProps) => {
  if (typeof children === "string") {
    return <pre className="border-2 cursor-pointer">{children}</pre>;
  }
  if (React.isValidElement(children)) {
    const classname = children?.props?.className ?? "";
    const classNameWithoutCode = classname?.replace("code", "").trim();
    const language = classNameWithoutCode?.replace("lang-", "");

    console.log({ language });

    return (
      <div className="bg-base-300 rounded my-4">
        <div className="flex justify-between px-2 pt-2 text-xs">
          <p>{language}</p>
          <div
            className="flex gap-1 cursor-pointer"
            onClick={() =>
              navigator.clipboard.writeText(children.props.children)
            }
          >
            <ClipboardIcon className="h-4 w-4" />
            Copy code
          </div>
        </div>
        <SyntaxHighlighter
          language={language}
          className="rounded-b"
          style={materialDark}
        >
          {children.props.children}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <div className="border bg-base-100">
      <pre className="border-2">{children}</pre>
    </div>
  );
};

const H1 = ({ children, ...props }: any) => (
  <h1 className="text-3xl">{children}</h1>
);
const H2 = ({ children, ...props }: any) => (
  <h2 className="text-2xl">{children}</h2>
);
const H3 = ({ children, ...props }: any) => (
  <h3 className="text-xl">{children}</h3>
);

const Markdown: React.FC<MarkdownProps> = ({ markdown = "" }) => {
  console.log();

  return (
    <MarkdownTOJSX
      options={{
        overrides: {
          code: {
            component: CodeBlock,
            props: {
              className: "code",
            },
          },
          h1: {
            component: H1,
            props: {
              className: "H1",
            },
          },
          h2: {
            component: H2,
            props: {
              className: "H1",
            },
          },
          h3: {
            component: H3,
            props: {
              className: "H1",
            },
          },
          pre: {
            component: PreBlock,
            props: {
              className: "Pre",
            },
          },
        },
      }}
    >
      {markdown}
    </MarkdownTOJSX>
  );
};

export default Markdown;
