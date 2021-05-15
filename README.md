# battery-prompter

This little utility is meant for Macbook users. It does the following...
- prompts you to plugin when the battery drops below 10% and is not charging
- prompts you to unplug when the battery is above 90% and is charging

## Why?
I'd like my battery to last as long as possible, but most days I sit at my desk working on the Macbook. Apple says that charging/decharging is a good way to keep your battery healthy. I tried other battery warning apps. None were smart enough to recognize an external thunderbolt 3 connection with power delivery (that doesn't deliver enough power to charge the laptop) compared to an actual Apple power adapter. This utility is smart enough to check if the battery is actually charging.


## How to use

Run it in continuous mode in the background like so...
```
node battery-prompter.js continuous
```