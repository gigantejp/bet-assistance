local scripts = arg[0]:match("^(.*generator[/%\\])")
dofile(scripts.."lib/makereel.lua")

local symsetbase15 = {
	0, -- 1 wild (2, 3, 4 reels only)
	1, -- 2 crown    5000
	2, -- 3 ruby     1500
	5, -- 4 diamond  500
	6, -- 5 emerald  200
	6, -- 6 amber    50
	3, -- 7 sapphire 50
	3, -- 8 amethyst 40
}
local symsetbase24 = {
	1, -- 1 wild (2, 3, 4 reels only)
	4, -- 2 crown    5000
	4, -- 3 ruby     1500
	5, -- 4 diamond  500
	5, -- 5 emerald  200
	5, -- 6 amber    50
	10, -- 7 sapphire 50
	10, -- 8 amethyst 40
}
local symsetbase3 = {
	1, -- 1 wild (2, 3, 4 reels only)
	1, -- 2 crown    5000
	4, -- 3 ruby     1500
	8, -- 4 diamond  500
	9, -- 5 emerald  200
	9, -- 6 amber    50
	6, -- 7 sapphire 50
	6, -- 8 amethyst 40
}

local symsetfall15 = {
	0, -- 1 wild (2, 3, 4 reels only)
	1, -- 2 crown    5000
	2, -- 3 ruby     1500
	5, -- 4 diamond  500
	6, -- 5 emerald  200
	6, -- 6 amber    50
	3, -- 7 sapphire 50
	3, -- 8 amethyst 40
}
local symsetfall24 = {
	0, -- 1 wild (2, 3, 4 reels only)
	3, -- 2 crown    5000
	5, -- 3 ruby     1500
	6, -- 4 diamond  500
	6, -- 5 emerald  200
	6, -- 6 amber    50
	9, -- 7 sapphire 50
	9, -- 8 amethyst 40
}
local symsetfall3 = {
	0, -- 1 wild (2, 3, 4 reels only)
	2, -- 2 crown    5000
	4, -- 3 ruby     1500
	8, -- 4 diamond  500
	9, -- 5 emerald  200
	9, -- 6 amber    50
	6, -- 7 sapphire 50
	6, -- 8 amethyst 40
}

local neighbours = {
	--1, 2, 3, 4, 5, 6, 7, 8,
	{ 4, 0, 0, 0, 0, 0, 0, 0,}, -- 1 wild (2, 3, 4 reels only)
	{ 0, 4, 0, 0, 0, 0, 0, 0,}, -- 2 crown
	{ 0, 0, 4, 0, 0, 0, 0, 0,}, -- 3 ruby
	{ 0, 0, 0, 3, 0, 0, 0, 0,}, -- 4 diamond
	{ 0, 0, 0, 0, 3, 0, 0, 0,}, -- 5 emerald
	{ 0, 0, 0, 0, 0, 2, 0, 0,}, -- 6 amber
	{ 0, 0, 0, 0, 0, 0, 2, 0,}, -- 7 sapphire
	{ 0, 0, 0, 0, 0, 0, 0, 2,}, -- 8 amethyst
}

local function reelgen(n, isfall)
	local ss
	if n == 1 or n == 5 then
		ss = tcopy(isfall and symsetfall15 or symsetbase15)
	elseif n == 2 or n == 4 then
		ss = tcopy(isfall and symsetfall24 or symsetbase24)
	else
		ss = tcopy(isfall and symsetfall3 or symsetbase3)
	end
	return makereel(ss, neighbours)
end

if autoscan then
	return reelgen
end

math.randomseed(os.time())
local isfall = false
printreel(reelgen(1, isfall))
printreel(reelgen(2, isfall))
printreel(reelgen(3, isfall))
printreel(reelgen(4, isfall))
printreel(reelgen(5, isfall))
