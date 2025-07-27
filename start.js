async function launch() {
  let c = "b825f194-51ef-46ae-9853-4224b0c4ed1e";
  var e = await new Promise((a) => {
    chrome.storage.sync.get([c], function (e) {
      try {
        a(JSON.parse(e[c]));
      } catch (e) {
        console.error(e), a({});
      }
    });
  });
  e && Object.keys(e).length && (await executeTasks(getTasks(e), e));
}
launch();
