// Renders one or more schema.org objects as a JSON-LD script tag.
// The serialized JSON is escaped so embedded user content (profile
// text, FAQ) cannot break out of the <script> element.
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
