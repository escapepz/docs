# Game time - PZwiki

Source: https://pzwiki.net/wiki/Game_time

This page has been revised for the current _stable_ version ([41.78.16](https://pzwiki.net/wiki/Build_41.78.16 "Build 41.78.16")).

**Game time** in Project Zomboid is dependent on the [Time setting in sandbox](https://pzwiki.net/wiki/Custom_Sandbox#Time "Custom Sandbox"), by default 1 real life hour equals to 1 in-game day. See the table below for details.

## Real time vs. game time

[Community] [Reference]

| Real time (24h) | Game time (24h) |
| :-------------- | :-------------- |
| 00:01:00        | 00:24:00        |
| 00:02:00        | 00:48:00        |
| 00:03:00        | 01:12:00        |
| 00:04:00        | 01:36:00        |
| 00:05:00        | 02:00:00        |
| 00:06:00        | 02:24:00        |
| 00:07:00        | 02:48:00        |
| 00:08:00        | 03:12:00        |
| 00:09:00        | 03:36:00        |
| 00:10:00        | 04:00:00        |
| ...             | ...             |
| 01:00:00        | 24:00:00        |

| Game time (24h) | Real time (24h) |
| :-------------- | :-------------- |
| 01:00:00        | 00:02:30        |
| 02:00:00        | 00:05:00        |
| 03:00:00        | 00:07:30        |
| 04:00:00        | 00:10:00        |
| 05:00:00        | 00:12:30        |
| 06:00:00        | 00:15:00        |
| 07:00:00        | 00:17:30        |
| 08:00:00        | 00:20:00        |
| 09:00:00        | 00:22:30        |
| 10:00:00        | 00:25:00        |

## World dates

[Community] [Reference]

- Defaults of class: 2012,7,22,9,0
- Zombie Outbreak: 1993,6,8,9,0
- Game start: StartYear, StartMonth, StartDay, StartTimeOfDay, 0

_these are persistent values based on the sandbox start values_

## GameTime class

[Community] [JavaAPI] [Reference]

`GameTime` is the main class for time and date functions.

### GameTime instance

[Community] [JavaAPI] [Example]

`getGameTime()` returns the actual instance, `GameTime.instance` from Lua is not the same and has the defaults of the class.

### Calendar and date functions

[Community] [JavaAPI] [Reference]

_Month, Day are used like indexes starting from 0, increase / lower them by 1 where needed_

### Calculate time difference by using calendar functionality

[Community] [LuaAPI] [Example]

```lua
local timeCalendar = getGameTime():getCalender()
local currentTime = timeCalendar:getTimeInMillis()

--safe to do on GameTime instance calendar but you can get a new calendar instead with Calendar.getInstance()
timeCalendar:set(1993,6,8,9,0)
local dateTime = timeCalendar:getTimeInMillis()

--calculate and do things on difference
local dt = math.abs(currentTime - dateTime)
print("Calculated Time Difference: ",dt)
local minMod, hourMod, dayMod = 1000*60, 1000*60*60, 1000*60*60*24
local days = math.floor(dt/dayMod)
if days ~= 0 then
	print("D: ",days)
	dt = dt % dayMod
end
local hours = math.floor(dt/hourMod)
if hours ~= 0 then
	print("H: ",hours)
	dt = dt % hourMod
end
local minutes = math.floor(dt/minMod)
if minutes ~= 0 then
	print("M: ",minutes)
	dt = dt - minutes*minMod
end
```

## Cross class functionality

[Community] [Reference]

- Updates the helicopter values for day, start & end time. Calls the helicopter pickRandomTarget.
- `ErosionSeason` also has dawn, dusk times which are more accurate and use float type.

## Notes

[Community] [Reference] [BestPractice]

- Project Zomboid uses the `PZCalendar` class for calendar, which has available a minimal number of functions from the java `Calendar` class. The Kahlua `os.date` has a very similar functionality and can be somewhat limited as well, especially when it comes to locales.
- You can get the real time by using the `Calendar.getInstance()` which always return a new `PZCalendar` object with current time or the `os.time` function. However game functions should rarely require these.
- 41.68 - When Using the Event `EveryHours`, the `getNightsSurvived` and `getWorldAgeHours` will be lower by a day, every day at 7.

## See also

[Community] [Reference]

- [GameTime guide](..\Common\PZModdingGuides\guides\GameTime.md) by albion.
