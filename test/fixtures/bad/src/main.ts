// Fixture source that reproduces the two review findings the validator must catch:
//   1. obsidianmd/regex-lookbehind        (lookbehind unsupported on iOS < 16.4)
//   2. obsidianmd/no-static-styles-assignment (direct element.style assignment)
export function render(el: HTMLElement, text: string): void {
  const re = /(?<=^|\s)#(\w+)/g;
  re.exec(text);
  el.style.paddingLeft = "8px";
}
