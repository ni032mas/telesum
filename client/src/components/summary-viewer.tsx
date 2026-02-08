import Markdown from "react-markdown";

export function SummaryViewer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <Markdown>{content}</Markdown>
    </div>
  );
}
