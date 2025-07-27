---
layout: post
title: '[EN] Myth of consentual Windows install'
date: '2025-07-27 00:47:12 +0000'
category: it
category: blog
---

Windows install doesn't care what you want or what SSD/HDD you want to use, because it does not consent to that. For example, for a while I had only 3 disks in my PC, so I bought an additional one I wanted to use as an external disk for games and movies. Everything was fine until yesterday when I bought another one I needed for my Arch install. So, while I was fine with using it as an external disk as well and swapping my current external SSD with it when needed, I thought maybe I could insert that drive into the case and use the smaller drive that is used for games/files too, and just have 2 external drives for games.

I didn't realize that Windows, for whatever reason, installs the bootloader on another drive completely if it finds a bit of empty space, even if you don't fucking select that drive for the install. So now I can't take out the drive I want because the fucking Windows bootloader is there.

Of course, there's a solution using diskpart on Windows to transfer it to another drive or something, and while it might be possible, I'm just thinking of all the users that would be willing to try Linux and how they're most likely going to get fucked by M$ because dumb Windows doesn't fucking care what you want to use and how you want to use it. Because your PC is not owned by you, it's owned by Microsoft. Screw that.

By the way, I've read some things about the 14KB TCP rule, so from now on all the pics are stored as links that you can click, so they won't load automatically and waste your round trips and time.

[picture][picture]

[picture]: https://raw.githubusercontent.com/burstw0w/blog/refs/heads/main/_assets/images/consent.avif
