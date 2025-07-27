function getTasks(i) {
  let c = {
    loginButton:
      "//Button[contains(" + xPathLowerCase("text()") + ',"login" )]',
    logoutButton:
      "//span[contains(" + xPathLowerCase("text()") + ',"logout" )]',
    loginPage: '//div[@class="login-bg pull-left"]',
    loginUsername:
      '//input[@formcontrolname="userid" and @placeholder="User Name"]',
    loginPassword:
      '//input[@formcontrolname="password" and @placeholder="Password"]',
    signInButton:
      "//button[contains(" + xPathLowerCase("text()") + ',"sign in" )]',
    source:
      '//p-autocomplete[@formcontrolname="origin"]//input[@role="searchbox"]',
    sourceItem:
      '//p-autocomplete[@formcontrolname="origin"]//*[@role="option"][1]',
    destination:
      '//p-autocomplete[@formcontrolname="destination"]//input[@role="searchbox"]',
    destinationItem:
      '//p-autocomplete[@formcontrolname="destination"]//*[@role="option"][1]',
    jounrneyDate: '//*[@id="jDate"]/span/input',
    jounrneyQuota:
      '//p-dropdown[@formcontrolname="journeyQuota"]//div[@role="button"]',
    quotaListItem:
      '//p-dropdown[@formcontrolname="journeyQuota"]//li[@role="option" and contains(' +
      xPathLowerCase("@aria-label") +
      ',"' +
      lower(i.quota) +
      '" )]',
    searchButton:
      '//button[@type="submit" and contains(' +
      xPathLowerCase("text()") +
      ',"search")]',
    trainListContainer:
      '//div[contains(@class,"form-group") and descendant::strong[contains(' +
      xPathLowerCase("text()") +
      ',"' +
      lower(i.train) +
      '" )]]',
    trainsListResult:
      "//button[contains(" +
      xPathLowerCase("text()") +
      ',"sort by") and //span[contains(' +
      xPathLowerCase("text()") +
      ',"duration" )]]',
    trainSeat:
      '//div[contains(@class,"form-group") and descendant::strong[contains(' +
      xPathLowerCase("text()") +
      ',"' +
      lower(i.train) +
      '" )]]//strong[contains(' +
      xPathLowerCase("text()") +
      ',"' +
      lower(i.seatType) +
      '" )]',
    trainSeatAvaiability:
      '//div[contains(@class,"form-group") and descendant::strong[contains(' +
      xPathLowerCase("text()") +
      ',"' +
      lower(i.train) +
      '" )]]//div[contains(@class,"pre-avl")]',
    bookButton:
      '//div[contains(@class,"form-group") and descendant::strong[contains(' +
      xPathLowerCase("text()") +
      ',"' +
      lower(i.train) +
      '" )]]//button[contains(text(), "Book Now") and not(contains(@class,"disable-book"))]',
    passengerDetailsContainer:
      '//div[descendant::span[contains(text(),"Passenger Details")] and ./p-panel and //input]',
    contactDetailsContainer:
      '//div[descendant::span[contains(text(),"Contact Details")] and ./p-panel and //input]',
    otherPreferencesDetailsContainer:
      '//div[descendant::span[contains(text(),"Other Preferences")] and ./p-panel and //input]',
    paymentModeDetailsContainer:
      '//div[descendant::span[contains(text(),"Payment Mode")] and ./p-panel and //input]',
    mobileNumber: '//input[@formcontrolname="mobileNumber" and @type="text"]',
    captchaImg: '//img[contains(@class,"captcha")]',
    captchaInput:
      '//img[contains(@class,"captcha")]/following::input[@formcontrolname="captcha"]',
    continueButton:
      "//button[contains(" +
      xPathLowerCase("text()") +
      ',"back" )]/following-sibling::button[contains(' +
      xPathLowerCase("text()") +
      ',"continue" )]',
    reviewPage:
      '//div[descendant::span[contains(text(),"Passenger Details")] and //p-panel  and contains(@id,"review")]',
    confimationDialog:
      '//*[@id="divMain"]//p-confirmdialog//div[ contains(@class, "confirmdialog") and //span[contains(' +
      xPathLowerCase("text()") +
      ',"confirmation")]]',
    paymentSelection:
      '//div[descendant::span[contains(text(),"Payment Methods") and @class="payment_opt"]]/following-sibling::div[@id="psgn-form"]',
  };
  function t(e) {
    return getElementByXpath(e) ? { state: 1 } : { state: 2 };
  }
  return [
    {
      id: "homePageOpenLoginForm",
      dependency: [],
      check: async function () {
        return i.password || i.username ? t(c.loginButton) : { state: 0 };
      },
      execute: async () => {
        await sleep(500), hitButton(c.loginButton);
      },
    },
    { id: "loginPageOpen", dependency: [], check: t.bind(this, c.loginPage) },
    {
      id: "loginPageEnterUsername",
      dependency: ["loginPageOpen"],
      check: async function (e) {
        return e.username ? t(c.loginUsername) : { state: 0 };
      },
      execute: async function () {
        setInput(c.loginUsername, i.username);
      },
    },
    {
      id: "loginPageEnterPassword",
      dependency: ["loginPageOpen"],
      check: function (e) {
        return e.password ? t(c.loginPassword) : { state: 0 };
      },
      execute: function () {
        setInput(c.loginPassword, i.password);
      },
    },
    {
      id: "loginPageEnterCapcha",
      dependency: ["loginPageOpen"],
      type: "loop",
      check: async function (e) {
        var t;
        return e.googleApiKey && (await getElementByXpath(c.loginPage))
          ? ((e = getElementByXpath(c.captchaImg)),
            (t = getElementByXpath(c.captchaInput)),
            e && t ? { state: 1 } : { state: 2 })
          : { state: 0 };
      },
      execute: async function (e, t, n) {
        if (!getElementByXpath(c.loginPage) || 0 === n.state) return !1;
        let a = getElementByXpath(c.captchaImg).src;
        try {
          var o = await makeAiCall(i.googleApiKey, a);
          setInput(c.captchaInput, o);
        } catch (e) {
          return !0;
        }
        await retry(async () => (await waitForElement(c.captchaImg)).src !== a);
      },
    },
    {
      id: "loginPageEnterButton",
      dependency: ["loginPageOpen"],
      type: "loop",
      check: async function () {
        var e, t, n;
        return !getElementByXpath(c.loginPage) ||
          ((e = getElementByXpath(c.loginUsername)),
          (t = getElementByXpath(c.loginPassword)),
          (n = getElementByXpath(c.captchaInput)),
          e && e.value && e.value.length <= 3) ||
          (t && t.value && t.value.length <= 3) ||
          (n && n.value && n.value.length <= 3)
          ? { state: 0 }
          : e && t && n && n.value && e.value && t.value
          ? { state: 1 }
          : { state: 2 };
      },
      execute: async function (e, t, n) {
        if (!getElementByXpath(c.loginPage || 0 === n.state)) return !1;
        await sleep(150), hitButton(c.signInButton);
      },
    },
    {
      id: "trainSearchUi",
      check: async function () {
        return (
          await waitForElement(c.loginButton),
          await waitForElement(c.logoutButton),
          await notWaitForElement(c.loginButton),
          { state: 1 }
        );
      },
    },
    {
      id: "trainSearchUiSource",
      dependency: ["trainSearchUi"],
      check: async function (e) {
        return e.source ? t(c.source) : { state: 0 };
      },
      execute: async function () {
        i.source &&
          (await fillAutoComplete(c.source, lower(i.source), c.sourceItem));
      },
    },
    {
      id: "trainSearchUiDestination",
      dependency: ["trainSearchUi"],
      check: async function (e) {
        return e.destination ? t(c.destination) : { state: 0 };
      },
      execute: async function () {
        i.destination &&
          (await fillAutoComplete(
            c.destination,
            lower(i.destination),
            c.destinationItem
          ));
      },
    },
    {
      id: "trainSearchUiDate",
      dependency: ["trainSearchUi"],
      check: async function (e) {
        return e.date ? t(c.jounrneyDate) : { state: 0 };
      },
      execute: async function () {
        var e;
        i.date &&
          ((e = getElementByXpath(c.jounrneyDate)).focus(),
          (e.value = i.date),
          await sleep(50),
          e.dispatchEvent(new Event("keydown", { bubbles: !1 })),
          e.dispatchEvent(new Event("input", { bubbles: !1 })),
          await sleep(150));
      },
    },
    {
      id: "trainSearchUiQuota",
      dependency: ["trainSearchUi"],
      check: async function (e) {
        return e.quota ? t(c.jounrneyQuota) : { state: 0 };
      },
      execute: async function () {
        i.quota && (await fillDropDown(c.jounrneyQuota, c.quotaListItem));
      },
    },
    {
      id: "trainSearchUiSearchButton",
      dependency: [
        "trainSearchUi",
        "trainSearchUiSource",
        "trainSearchUiDestination",
        "trainSearchUiDate",
        "trainSearchUiQuota",
      ],
      check: async function (e) {
        var t, n, a;
        return 0 == e.autoSearchClick
          ? { state: 0 }
          : ((e = getElementByXpath(c.source)),
            (t = getElementByXpath(c.destination)),
            (n = getElementByXpath(c.quotaListItem)),
            (a = getElementByXpath(c.jounrneyDate)) &&
            a.value &&
            e &&
            e.value &&
            t &&
            t.value &&
            n
              ? { state: 1 }
              : { state: 2 });
      },
      execute: async function () {
        await sleep(150), hitButton(c.searchButton);
      },
    },
    {
      id: "trainSearchResults",
      dependency: [],
      check: t.bind(this, c.trainsListResult),
    },
    {
      id: "trainSearchResultsTrainSeat",
      dependency: ["trainSearchResults"],
      check: async function (e) {
        return e.train && e.seatType ? t(c.trainSeat) : { state: 0 };
      },
      execute: async function () {
        await sleep(150), hitButton(c.trainSeat);
      },
    },
    {
      id: "trainSearchResultsTrainSeatAvaiability",
      dependency: ["trainSearchResultsTrainSeat"],
      check: async function (e) {
        return e.train && e.seatType ? t(c.trainSeatAvaiability) : { state: 0 };
      },
      execute: async function () {
        await sleep(150), hitButton(c.trainSeatAvaiability);
      },
    },
    {
      id: "trainSearchResultsBookButton",
      dependency: ["trainSearchResultsTrainSeatAvaiability"],
      check: async function (e) {
        return e.train && e.seatType ? t(c.bookButton) : { state: 0 };
      },
      execute: async function () {
        await sleep(150), hitButton(c.bookButton);
      },
    },
    {
      id: "passengerDetails",
      dependency: [],
      check: async function (e) {
        return (e.passengers || []).length
          ? t(c.passengerDetailsContainer)
          : { state: 0 };
      },
      execute: async function (e) {
        var t = e.passengers || [],
          n = Math.min(t.length, "tatkal" === e.quota.toLowerCase() ? 4 : 6);
        for (let e = 0; e < n; e++) {
          0 < e &&
            (hitButton('//a/span[contains(text(),"Add Passenger")]'),
            await sleep(150));
          var a = t[e];
          a.autoFill
            ? await fillAutoComplete(
                '//app-passenger//p-autocomplete[@formcontrolname="passengerName"]//input[not(@readonly)]',
                a.name,
                '//app-passenger//p-autocomplete[@formcontrolname="passengerName"]//*[@role="option" and ./strong[contains(' +
                  xPathLowerCase("text()") +
                  ',"' +
                  lower(a.name) +
                  '" )]]',
                1e3
              )
            : (await setInput(
                '(//app-passenger//p-autocomplete[@formcontrolname="passengerName"]//input)[' +
                  (e + 1) +
                  "]",
                a.name.substring(0, 16)
              ),
              await sleep(50),
              await setInput(
                '(//app-passenger//input[@formcontrolname="passengerAge"])[' +
                  (e + 1) +
                  "]",
                a.age
              ),
              await sleep(50),
              setSelectBoxByText(
                '(//app-passenger//select[@formcontrolname="passengerNationality"])[' +
                  (e + 1) +
                  "]",
                a.country || "India"
              ),
              await sleep(50),
              setSelectBoxByText(
                '(//app-passenger//select[@formcontrolname="passengerBerthChoice"])[' +
                  (e + 1) +
                  "]",
                a.preference || "Upper"
              ),
              await sleep(50),
              setSelectBoxByText(
                '(//app-passenger//select[@formcontrolname="passengerGender"])[' +
                  (e + 1) +
                  "]",
                a.gender || ""
              ),
              getElementByXpath(
                '(//app-passenger//select[@formcontrolname="passengerFoodChoice"])[' +
                  (e + 1) +
                  "]"
              ) &&
                setSelectBoxByText(
                  '(//app-passenger//select[@formcontrolname="passengerFoodChoice"])[' +
                    (e + 1) +
                    "]",
                  a.foodChoice || "No Food"
                ),
              await sleep(50));
        }
      },
    },
    {
      id: "contactDetails",
      dependency: [],
      check: async function (e) {
        return e.mobile ? t(c.contactDetailsContainer) : { state: 0 };
      },
      execute: async function (e) {
        await waitForElement(c.mobileNumber),
          setInput(c.mobileNumber, e.mobile);
      },
    },
    {
      id: "otherPreferencesDetails",
      dependency: [],
      check: async function (e) {
        return e.ifConfirm
          ? getElementByXpath(c.otherPreferencesDetailsContainer)
            ? (await sleep(50),
              getElementByXpath(
                c.otherPreferencesDetailsContainer +
                  '//input[@type="checkbox"]/following-sibling::label[contains(text(),"Book only if confirm")]'
              ),
              { state: 1 })
            : { state: 2 }
          : { state: 0 };
      },
      execute: async function (e) {
        await sleep(150);
        var t =
          c.otherPreferencesDetailsContainer +
          '//input[@type="checkbox"]/following-sibling::label[contains(text(),"Book only if confirm")]';
        hitButton(t);
      },
    },
    {
      id: "paymentModeSelectionDetails",
      dependency: [],
      check: async function (e) {
        return e.paymentMode && (e.paymentMode, "null" !== e.paymentMode)
          ? t(c.paymentModeDetailsContainer)
          : { state: 1 };
      },
      execute: async function (e) {
        await sleep(150),
          hitButton(
            c.paymentModeDetailsContainer +
              '//*[contains(text(),"' +
              e.paymentMode +
              '")]//p-radiobutton//div[@role="radio"]'
          );
      },
    },
    {
      id: "journeyDetailsForm",
      dependency: [
        "otherPreferencesDetails",
        "contactDetails",
        "passengerDetails",
        "paymentModeSelectionDetails",
      ],
      check: async function (e) {
        return t(c.continueButton);
      },
      execute: async function (e) {
        await sleep(150), hitButton(c.continueButton);
      },
    },
    { id: "reviewPage", dependency: [], check: t.bind(this, c.reviewPage) },
    {
      id: "reviewPageEnterCapcha",
      dependency: ["reviewPage"],
      type: "loop",
      check: async function (e) {
        var t;
        return e.googleApiKey && (await getElementByXpath(c.reviewPage))
          ? ((e = getElementByXpath(c.captchaImg)),
            (t = getElementByXpath(c.captchaInput)),
            !e || !t || (t && t.value) ? { state: 2 } : { state: 1 })
          : { state: 0 };
      },
      execute: async function (e, t, n) {
        if (!getElementByXpath(c.reviewPage) || 0 === n.state) return !1;
        let a = getElementByXpath(c.captchaImg).src;
        try {
          var o = await makeAiCall(i.googleApiKey, a);
          setInput(c.captchaInput, o);
        } catch (e) {
          return !0;
        }
        await retry(async () => (await waitForElement(c.captchaImg)).src !== a);
      },
    },
    {
      id: "reviewPageContinueButton",
      dependency: ["reviewPage"],
      type: "loop",
      check: async function () {
        var e = getElementByXpath(c.captchaInput);
        return !e || (e.value.length <= 3 && 0 < e.value.length)
          ? { state: 0 }
          : getElementByXpath(c.continueButton) && e.value
          ? { state: 1 }
          : { state: 2 };
      },
      execute: async function (e) {
        if (!getElementByXpath(c.reviewPage) || 0 === e.state) return !1;
        await sleep(200), hitButton(c.continueButton);
      },
    },
    {
      id: "paymentSelection",
      dependency: [],
      check: t.bind(null, c.paymentSelection),
      execute: async function () {
        await sleep(150);
      },
    },
    {
      id: "paymentTypeSelection",
      dependency: ["paymentSelection"],
      check: async function (e) {
        return e.paymentType && (e.paymentType, "null" !== e.paymentType)
          ? t(
              c.paymentSelection +
                '//div[@id="pay-type"]//div[./span[contains(' +
                xPathLowerCase("text()") +
                ',"' +
                lower(e.paymentType) +
                '" )]]'
            )
          : { state: 0 };
      },
      execute: async function () {
        await sleep(150),
          hitButton(
            c.paymentSelection +
              '//div[@id="pay-type"]//div[./span[contains(' +
              xPathLowerCase("text()") +
              ',"' +
              lower(i.paymentType) +
              '" )]]'
          );
      },
    },
    {
      id: "paymentTypeSelectionContinueButton",
      dependency: ["paymentTypeSelection"],
      check: async function (e) {
        return e.paymentSelection &&
          (await sleep(100),
          getElementByXpath(
            c.paymentSelection +
              '//button[contains(text(),"Back")]/following-sibling::button[contains(text(),"Continue")]'
          ))
          ? { state: 1 }
          : { state: 0 };
      },
      execute: async function () {
        hitButton(
          c.paymentSelection +
            '//button[contains(text(),"Back")]/following-sibling::button[contains(text(),"Continue")]'
        );
      },
    },
    {
      id: "paymentGatewaySelection",
      dependency: ["paymentTypeSelection"],
      check: async function (e) {
        return e.paymentGateway &&
          (e.paymentGateway, "null" !== e.paymentGateway)
          ? t(
              '//div/div[ ancestor::div[contains(@class,"bank-box")] and ./span[contains(' +
                xPathLowerCase("text()") +
                ',"' +
                lower(e.paymentGateway) +
                '" )]]'
            )
          : { state: 0 };
      },
      execute: async function () {
        await sleep(150),
          hitButton(
            '//div/div[ ancestor::div[contains(@class,"bank-box")] and ./span[contains(' +
              xPathLowerCase("text()") +
              ',"' +
              lower(i.paymentGateway) +
              '" )]]'
          );
      },
    },
    {
      id: "paymentSelectionPayButton",
      dependency: ["paymentGatewaySelection"],
      check: t.bind(
        null,
        c.paymentSelection +
          '//button[contains(text(),"Back")]/following-sibling::button[contains(text(),"Pay")]'
      ),
      execute: async function () {
        await sleep(150),
          hitButton(
            c.paymentSelection +
              '//button[contains(text(),"Back")]/following-sibling::button[contains(text(),"Pay")]'
          );
      },
    },
    {
      id: "confimationDialog",
      dependency: [],
      type: "loop",
      check: async function (e) {
        return t(c.confimationDialog);
      },
      execute: async function () {
        await sleep(150);
        var e =
          c.confimationDialog +
          "//button[./span[contains(" +
          xPathLowerCase("text()") +
          ',"yes")]]';
        hitButton(e);
      },
    },
  ];
}
