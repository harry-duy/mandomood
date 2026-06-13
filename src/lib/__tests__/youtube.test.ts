import { test } from "node:test";
import assert from "node:assert/strict";
import { parseYouTubeId } from "../youtube";

test("parseYouTubeId: id 11 ký tự dán thẳng", () => {
  assert.equal(parseYouTubeId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});

test("parseYouTubeId: link watch?v=", () => {
  assert.equal(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});

test("parseYouTubeId: youtu.be ngắn", () => {
  assert.equal(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});

test("parseYouTubeId: /embed/ và /shorts/", () => {
  assert.equal(parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(parseYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
});

test("parseYouTubeId: link kèm tham số khác vẫn lấy đúng v", () => {
  assert.equal(
    parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=abc"),
    "dQw4w9WgXcQ"
  );
});

test("parseYouTubeId: input không hợp lệ → null", () => {
  assert.equal(parseYouTubeId(""), null);
  assert.equal(parseYouTubeId("không phải link"), null);
  assert.equal(parseYouTubeId("https://vimeo.com/123456"), null);
  assert.equal(parseYouTubeId("https://youtu.be/short"), null);
});
