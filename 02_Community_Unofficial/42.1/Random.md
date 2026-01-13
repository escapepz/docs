# Random - PZwiki

Source: https://pzwiki.net/wiki/Random

This page has been updated to an _unstable_ beta version ([42.1.1](https://pzwiki.net/wiki/Build_42.1.1 "Build 42.1.1")).

**Random** is a java object which can be used to generate random numbers. It is about 40% more performance efficient than standard [ZombRand](https://pzwiki.net/wiki/ZombRand "ZombRand") and should be used in place of it.

An instance can be created with `newrandom()`. It allows you to set a seed for the random and its upper limit is inclusive rather than exclusive.

## Using Random

[Community] [JavaAPI] [Example]

To use Random, you first need to get an instance of it. This can be done with `newrandom()` which will return a new instance of the class. You can then use this object to generate random numbers.

```lua
-- cache it for performance reasons, this random object can be shared between multiple different random calls
local random_instance = newrandom()

-- generate a random integer between 1 and 5
local randomNumber = random_instance:random(5)

-- generate a random integer between 5 and 10
local randomNumber = random_instance:random(5, 10)

-- generate a random float between 0 and 1
local randomNumber = random_instance:random()

-- generate a random float between 0 and 5
local randomNumber = random_instance:random() * 5
```

If you use the random value in a function, it is better to cache the Random instance outside of it:

```lua
local random_instance = newrandom()

local coinFlip = function()
    return random_instance:random(0,1) == 1
end
```

## Seeds

[Community] [JavaAPI] [Example]

You can also set a seed for the random number generator. This can be done with `Random:seed(seed)`. This will set the seed for the random number generator and will make sure that the random numbers generated are the same each time the seed is set to the same value. Keep in mind that generating a random number changes the seed, so it is only guaranteed that the same numbers will be generated if you make exactly the same calls in the same order after setting the seed.

```lua
-- cache it for performance reasons
local random_instance = newrandom()

-- set the seed to 12345
random_instance:seed(12345)

-- generate a random number between 0 and 10
local randomNumber = random_instance:random(0, 10) -- will generate the same number every time because the seed is always 12345
```

## See also

[Community] [Reference]

- [ZombRand](https://pzwiki.net/wiki/ZombRand "ZombRand")
- [Noise Maps](https://pzwiki.net/wiki/Noise_Maps "Noise Maps")
