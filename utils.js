class CriticalSection {
  constructor() {
    (this.isLocked = !1), (this.queue = []);
  }
  async enter() {
    return new Promise((e) => {
      this.isLocked ? this.queue.push(e) : ((this.isLocked = !0), e());
    });
  }
  leave() {
    0 < this.queue.length ? this.queue.shift()() : (this.isLocked = !1);
  }
}
async function sleep(t) {
  return (
    (t = t || 10),
    new Promise((e) => {
      setTimeout(e, t);
    })
  );
}
function getElementByXpath(e) {
  return document.evaluate(
    e,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}
async function retry(e) {
  for (;;) {
    if (await e()) break;
    await sleep(250);
  }
}
async function waitForElement(n) {
  return new Promise(async (t) => {
    await retry(async () => {
      var e = getElementByXpath(n);
      return e && t(e), !!e;
    });
  });
}
async function notWaitForElement(e) {
  await retry(async () => !getElementByXpath(e));
}
function xPathLowerCase(e) {
  return (
    "translate(" +
    e +
    ", 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"
  );
}
function setInput(e, t) {
  e = getElementByXpath(e);
  return (
    e &&
      ((e.value = t),
      e.dispatchEvent(new Event("keydown", { bubbles: !0 })),
      e.dispatchEvent(new Event("input", { bubbles: !0 }))),
    !!e
  );
}
function hitButton(e) {
  e = getElementByXpath(e);
  return e && e.click(), !!e;
}
function lower(e) {
  return e ? new String(e).toString().toLowerCase() : "";
}
async function makeAiCall(e, t) {
  var n = t.indexOf(","),
    a = t.substr(0, n),
    t = t.substring(n + 1);
  try {
    return (
      await (
        await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
            e,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "output only without space & trimmed text in the image, image only contains alphanumeric & special characters. Image might be heavy pixelated, distorted and might be in a 2 color.",
                    },
                    { inline_data: { mime_type: a.split(/[;:]/)[1], data: t } },
                  ],
                },
              ],
            }),
          }
        )
      ).json()
    ).candidates[0].content.parts[0].text;
  } catch (e) {
    throw e;
  }
}
async function fillAutoComplete(e, t, n, a) {
  (e = getElementByXpath(e)),
    (e.value = t),
    e.focus(),
    await sleep(50),
    e.dispatchEvent(new Event("keydown", { bubbles: !0 })),
    e.dispatchEvent(new Event("input", { bubbles: !0 })),
    (t = n),
    (e = await waitForElement(t));
  await sleep(a || 150), e.click();
}
async function fillDropDown(e, t) {
  hitButton(e);
  e = t;
  await waitForElement(e), await sleep(100), getElementByXpath(e).click();
}
function setSelectBoxByText(e, t) {
  var n,
    a,
    e = getElementByXpath(e);
  for (n of e.options) n.selected = !1;
  for (a of e.options)
    a.text.toLowerCase() === t.toLowerCase() && (a.selected = !0);
  e.dispatchEvent(new Event("change"));
}
async function executeTasks(e, i) {
  let o = {},
    s = new CriticalSection();
  e = e.map((e) =>
    (async (a) =>
      retry(async () => {
        var t = a.id;
        if (
          !(a.dependency || []).reduce(
            (e, t) => e && o[t] && 1 == o[t].state,
            !0
          )
        )
          return !1;
        let n = { state: 1 };
        if (
          (a.check && ((n = await a.check(i, o)), await sleep(50)),
          2 == n.state)
        )
          return !1;
        if (0 == n.state) return (o[t] = n), !0;
        {
          let e;
          return (a.execute &&
            ("loop" !== a.type && (await s.enter()),
            (e = await a.execute(i, o, n)),
            "loop" !== a.type) &&
            s.leave(),
          "boolean" == typeof e && e)
            ? !1
            : "loop" !== a.type && ((o[t] = n), !0);
        }
      }))(e)
  );
  return await Promise.allSettled(e), console.log(o), o;
}