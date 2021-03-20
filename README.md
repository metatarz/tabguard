![Tabguard](https://raw.githubusercontent.com/sirdmon/tabguard/master/src/assets/logo.png)

# Tabguard - Google Chrome Extension -

> Modern websites use CPU and bandwidth to do a myriad of things at once. Worse is when you notice that you won't be using any of them. TabGuard deals with many, many and many tabs open in a browser window, monitor their CPU, memory and network usage and stop those from wasting up resources.

# Motivation

I have seen a lot of people having multiple tabs opened in a browser window without paying too much attention to them. This tab overload, reduces one's ability to handle the browser, is a sign of exhaustion and untidiness, and may cause a faulty browser behaviour.

For self illustration purposes, in a middle of a million tabs journey, open up your browsers task manager (in Chrome with keyboard shortcut `Shift+Esc`) and carefully look at how your opened tabs and their ongoing processes are continiously being updated with memory, CPU and networking stats.

While most browsers have a number of policies to mitigate the performance impact of inactive tabs and available API's [see here](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API#policies_in_place_to_aid_background_page_performance), spending my life recommending those to developers without much success, I think it's time to put an end to this unsustainable wasting of resources and come up with a solution, at least for those willing to install this extension currently in a Dev Channel like Google Chrome Browser **(a pause for the nerdish applauses)**

# How does it work

![Tabguard in action](https://raw.githubusercontent.com/sirdmon/tabguard/master/src/assets/tabguard-in-action.png)

The extension monitors the CPU / Memory / Network usage of all browser processes linked to opened tabs.
Whenever an inactive tab (i.e not highlighted or opened by the user) exceeds the memory, CPU and network thresholds it is automatically suspended thus preventing it from wasting up resources.

The suspended tab can be either saved up (_default behaviour_) or moved to a new group of tabs (_uncheck the option: auto saved tabs_)

# Local Development

1. Git clone this repo with `git clone https://github.com/sirdmn/tabguard` or download the latest release.

2. Open up an Unstable Google Chrome Browser (Dev Channel)

3. Navigate to `chrome://extensions`, and check out the developer mode.

4. Click <kbd>load unpacked</kbd>

# Roadmap

- [x] Google Chrome Extension
- [ ] Gather up usage metrics
- [ ] Firefox Add-on
- [ ] Safari Extension

# Contribution

If you liked this project, please check out [DAS](https://digital.audits) too.
Contributions are always welcomed!
I would love to hear how Tabguard is helping you out.

# License

MIT &copy; David Monràs, 2021
