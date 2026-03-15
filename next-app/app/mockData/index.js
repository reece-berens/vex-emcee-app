/**
 * Mock Data for VEX Emcee App
 *
 * Provides fake teams and matches data for development/testing
 * when real API events are unavailable.
 *
 * To enable: set USE_MOCK_DATA = true
 * To disable: set USE_MOCK_DATA = false
 */

export const USE_MOCK_DATA = false;

// ============================================
// MOCK TEAMS
// ============================================

export const MOCK_TEAMS = [
	{
		ID: 1,
		InDivision: true,
		Number: "1234A",
		NumberSortOrder: 1,
		TeamName: "Robo Warriors",
		EventWLT: "5-2-0",
		QualiRank: 3,
	},
	{
		ID: 2,
		InDivision: true,
		Number: "1234B",
		NumberSortOrder: 2,
		TeamName: "Cyber Knights",
		EventWLT: "6-1-0",
		QualiRank: 1,
	},
	{
		ID: 3,
		InDivision: true,
		Number: "5678X",
		NumberSortOrder: 3,
		TeamName: "The Outlaws",
		EventWLT: "4-3-0",
		QualiRank: 5,
	},
	{
		ID: 4,
		InDivision: true,
		Number: "5678Z",
		NumberSortOrder: 4,
		TeamName: "Mech Mayhem",
		EventWLT: "3-4-0",
		QualiRank: 8,
	},
	{
		ID: 5,
		InDivision: true,
		Number: "9999A",
		NumberSortOrder: 5,
		TeamName: "Circuit Breakers",
		EventWLT: "5-2-0",
		QualiRank: 2,
	},
	{
		ID: 6,
		InDivision: true,
		Number: "9999B",
		NumberSortOrder: 6,
		TeamName: "Gear Grinders",
		EventWLT: "4-3-0",
		QualiRank: 6,
	},
	{
		ID: 7,
		InDivision: true,
		Number: "4101H",
		NumberSortOrder: 7,
		TeamName: "Reece's Pieces",
		EventWLT: "6-1-0",
		QualiRank: 4,
	},
	{
		ID: 8,
		InDivision: true,
		Number: "7862E",
		NumberSortOrder: 8,
		TeamName: "VEXodus",
		EventWLT: "2-5-0",
		QualiRank: 10,
	},
	{
		ID: 9,
		InDivision: true,
		Number: "31848F",
		NumberSortOrder: 9,
		TeamName: "E.V.I.L.",
		EventWLT: "3-4-0",
		QualiRank: 7,
	},
	{
		ID: 10,
		InDivision: true,
		Number: "15352D",
		NumberSortOrder: 10,
		TeamName: "Night Shift",
		EventWLT: "2-5-0",
		QualiRank: 9,
	},
	{
		ID: 11,
		InDivision: true,
		Number: "79096A",
		NumberSortOrder: 11,
		TeamName: "Fighting Falcons",
		EventWLT: "4-3-0",
		QualiRank: 11,
	},
	{
		ID: 12,
		InDivision: true,
		Number: "52558A",
		NumberSortOrder: 12,
		TeamName: "Hugoton Heroes",
		EventWLT: "1-6-0",
		QualiRank: 12,
	},
];

// ============================================
// MOCK TEAM INFO (detailed view)
// ============================================

const createTeamInfo = (team, prevId, nextId) => ({
	ID: team.ID,
	Location: "Kansas, USA",
	Number: team.Number,
	TeamName: team.TeamName,
	NextTeamID: nextId,
	PreviousTeamID: prevId,
	Sections: [
		{
			Name: "Event Stats",
			Order: 1,
			Display: [
				{ SectionLabel: "Record", SectionData: [team.EventWLT] },
				{ SectionLabel: "Ranking", SectionData: [`#${team.QualiRank}`] },
				{ SectionLabel: "OPR", SectionData: [(Math.random() * 100 + 50).toFixed(1)] },
			],
		},
		{
			Name: "Season Stats",
			Order: 2,
			Display: [
				{ SectionLabel: "Events Attended", SectionData: ["4"] },
				{ SectionLabel: "Awards", SectionData: ["Excellence Award", "Tournament Champion"] },
				{ SectionLabel: "Skills Score", SectionData: ["187"] },
			],
		},
	],
});

export const getMockTeamInfo = (teamId) => {
	const idx = MOCK_TEAMS.findIndex((t) => t.ID === teamId);
	if (idx === -1) return null;

	const team = MOCK_TEAMS[idx];
	const prevId = idx > 0 ? MOCK_TEAMS[idx - 1].ID : null;
	const nextId = idx < MOCK_TEAMS.length - 1 ? MOCK_TEAMS[idx + 1].ID : null;

	return createTeamInfo(team, prevId, nextId);
};

// ============================================
// MOCK MATCHES
// ============================================

// Helper to create scheduled times (today, starting at 9am, 8 min apart)
const createScheduledTime = (matchIndex) => {
	const base = new Date();
	base.setHours(9, 0, 0, 0);
	base.setMinutes(base.getMinutes() + matchIndex * 8);
	return base.toISOString();
};

export const MOCK_MATCHES = [
	// Qualification matches - 2v2 alliances
	{
		Key: "Q1",
		MatchName: "Q1",
		SortOrder: 1,
		Scored: true,
		Scheduled: createScheduledTime(0),
		Started: createScheduledTime(0),
		Blue: { Score: 45, TeamNumbers: ["1234A", "5678X"] },
		Red: { Score: 38, TeamNumbers: ["9999A", "4101H"] },
		BlueWin: true,
		RedWin: false,
		Tie: false,
	},
	{
		Key: "Q2",
		MatchName: "Q2",
		SortOrder: 2,
		Scored: true,
		Scheduled: createScheduledTime(1),
		Started: createScheduledTime(1),
		Blue: { Score: 52, TeamNumbers: ["1234B", "9999B"] },
		Red: { Score: 52, TeamNumbers: ["7862E", "31848F"] },
		BlueWin: false,
		RedWin: false,
		Tie: true,
	},
	{
		Key: "Q3",
		MatchName: "Q3",
		SortOrder: 3,
		Scored: true,
		Scheduled: createScheduledTime(2),
		Started: createScheduledTime(2),
		Blue: { Score: 61, TeamNumbers: ["5678Z", "15352D"] },
		Red: { Score: 44, TeamNumbers: ["79096A", "52558A"] },
		BlueWin: true,
		RedWin: false,
		Tie: false,
	},
	// 1v1 matches
	{
		Key: "Q4",
		MatchName: "Q4",
		SortOrder: 4,
		Scored: true,
		Scheduled: createScheduledTime(3),
		Started: createScheduledTime(3),
		Blue: { Score: 33, TeamNumbers: ["1234A"] },
		Red: { Score: 55, TeamNumbers: ["1234B"] },
		BlueWin: false,
		RedWin: true,
		Tie: false,
	},
	{
		Key: "Q5",
		MatchName: "Q5",
		SortOrder: 5,
		Scored: true,
		Scheduled: createScheduledTime(4),
		Started: createScheduledTime(4),
		Blue: { Score: 48, TeamNumbers: ["9999A"] },
		Red: { Score: 41, TeamNumbers: ["5678Z"] },
		BlueWin: true,
		RedWin: false,
		Tie: false,
	},
	// Back to 2v2
	{
		Key: "Q6",
		MatchName: "Q6",
		SortOrder: 6,
		Scored: true,
		Scheduled: createScheduledTime(5),
		Started: createScheduledTime(5),
		Blue: { Score: 39, TeamNumbers: ["4101H", "15352D"] },
		Red: { Score: 57, TeamNumbers: ["79096A", "1234A"] },
		BlueWin: false,
		RedWin: true,
		Tie: false,
	},
	{
		Key: "Q7",
		MatchName: "Q7",
		SortOrder: 7,
		Scored: true,
		Scheduled: createScheduledTime(6),
		Started: createScheduledTime(6),
		Blue: { Score: 66, TeamNumbers: ["52558A", "1234B"] },
		Red: { Score: 42, TeamNumbers: ["9999A", "7862E"] },
		BlueWin: true,
		RedWin: false,
		Tie: false,
	},
	// In-progress matches (Started but not Scored) - showing live/partial scores
	{
		Key: "Q8",
		MatchName: "Q8",
		SortOrder: 8,
		Scored: false,
		Scheduled: createScheduledTime(7),
		Started: createScheduledTime(7),
		Blue: { Score: 23, TeamNumbers: ["5678X", "4101H"] },
		Red: { Score: 18, TeamNumbers: ["31848F", "5678Z"] },
		BlueWin: false,
		RedWin: false,
		Tie: false,
	},
	{
		Key: "Q9",
		MatchName: "Q9",
		SortOrder: 9,
		Scored: false,
		Scheduled: createScheduledTime(8),
		Started: createScheduledTime(8),
		Blue: { Score: 0, TeamNumbers: ["9999B"] },
		Red: { Score: 0, TeamNumbers: ["15352D"] },
		BlueWin: false,
		RedWin: false,
		Tie: false,
	},
	// Upcoming (not started)
	{
		Key: "Q10",
		MatchName: "Q10",
		SortOrder: 10,
		Scored: false,
		Scheduled: createScheduledTime(9),
		Started: null,
		Blue: { Score: 0, TeamNumbers: ["1234A", "1234B"] },
		Red: { Score: 0, TeamNumbers: ["9999A", "5678X"] },
		BlueWin: false,
		RedWin: false,
		Tie: false,
	},
	{
		Key: "Q11",
		MatchName: "Q11",
		SortOrder: 11,
		Scored: false,
		Scheduled: createScheduledTime(10),
		Started: null,
		Blue: { Score: 0, TeamNumbers: ["7862E", "79096A"] },
		Red: { Score: 0, TeamNumbers: ["52558A", "9999B"] },
		BlueWin: false,
		RedWin: false,
		Tie: false,
	},
	// Playoff matches - 2v2 (upcoming)
	{
		Key: "SF1-1",
		MatchName: "SF1-1",
		SortOrder: 12,
		Scored: false,
		Scheduled: createScheduledTime(11),
		Started: null,
		Blue: { Score: 0, TeamNumbers: ["1234B", "9999A"] },
		Red: { Score: 0, TeamNumbers: ["5678X", "4101H"] },
		BlueWin: false,
		RedWin: false,
		Tie: false,
	},
	{
		Key: "SF2-1",
		MatchName: "SF2-1",
		SortOrder: 13,
		Scored: false,
		Scheduled: createScheduledTime(12),
		Started: null,
		Blue: { Score: 0, TeamNumbers: ["1234A", "9999B"] },
		Red: { Score: 0, TeamNumbers: ["31848F", "79096A"] },
		BlueWin: false,
		RedWin: false,
		Tie: false,
	},
];

// ============================================
// MOCK MATCH INFO (detailed view)
// ============================================

const createMatchTeam = (teamNumber) => {
	const team = MOCK_TEAMS.find((t) => t.Number === teamNumber) || { ID: 0, TeamName: "Unknown", QualiRank: 12 };
	
	// Parse WLT from team data
	const wltMatch = team.EventWLT?.match(/(\d+)-(\d+)-(\d+)/);
	const wins = wltMatch ? parseInt(wltMatch[1]) : 3;
	const losses = wltMatch ? parseInt(wltMatch[2]) : 3;
	const ties = wltMatch ? parseInt(wltMatch[3]) : 0;
	const totalMatches = wins + losses + ties;
	const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";
	
	// Generate random but realistic stats
	const driverSkills = Math.floor(Math.random() * 40) + 15;
	const progSkills = Math.floor(Math.random() * 30) + 10;
	const driverAttempts = Math.floor(Math.random() * 3) + 1;
	const progAttempts = Math.floor(Math.random() * 3) + 1;
	const totalPoints = Math.floor(Math.random() * 200) + 150;
	const avgPoints = (totalPoints / Math.max(totalMatches, 1)).toFixed(1);
	const wp = wins * 2 + ties;
	const sp = Math.floor(Math.random() * 150) + 50;
	const ap = Math.floor(Math.random() * 80) + 20;
	const awards = Math.floor(Math.random() * 3);
	
	// Season stats (larger numbers)
	const seasonWins = wins + Math.floor(Math.random() * 30) + 10;
	const seasonLosses = losses + Math.floor(Math.random() * 15) + 5;
	const seasonTies = Math.floor(Math.random() * 2);
	const seasonTotal = seasonWins + seasonLosses + seasonTies;
	const seasonWinRate = ((seasonWins / seasonTotal) * 100).toFixed(1);
	const qualWins = Math.floor(seasonWins * 0.7);
	const qualLosses = Math.floor(seasonLosses * 0.7);
	const qualTotal = qualWins + qualLosses;
	const qualWinRate = qualTotal > 0 ? ((qualWins / qualTotal) * 100).toFixed(1) : "0.0";
	const elimWins = seasonWins - qualWins;
	const elimLosses = seasonLosses - qualLosses;
	const elimTotal = elimWins + elimLosses;
	const elimWinRate = elimTotal > 0 ? ((elimWins / elimTotal) * 100).toFixed(1) : "0.0";
	
	return {
		ID: team.ID,
		SimpleStat: team.EventWLT,
		TeamLocator: "Kansas, USA",
		TeamName: team.TeamName,
		TeamNumber: teamNumber,
		Stats: [
			{
				Name: "This Event",
				Order: 1,
				Display: [
					{ 
						SectionLabel: "Overall WLT (Qualification + Elim.)", 
						SectionData: [`${wins}-${losses}-${ties}`, `${winRate}% win rate`] 
					},
					{ 
						SectionLabel: "Qualifications Ranking", 
						SectionData: [`#${team.QualiRank}`] 
					},
					{ 
						SectionLabel: "Ranking Points", 
						SectionData: [`${wp} WP - ${sp} SP - ${ap} AP`] 
					},
					{ 
						SectionLabel: "Skills", 
						SectionData: [
							`Driver: ${driverAttempts} attempts, ${driverSkills} high score`,
							`Programming: ${progAttempts} attempts, ${progSkills} high score`
						] 
					},
					{ 
						SectionLabel: "Points Scored", 
						SectionData: [`Total: ${totalPoints} points`, `Average per match: ${avgPoints} points`] 
					},
				],
			},
			{
				Name: "Season Stats Entering This Tournament",
				Order: 2,
				Display: [
					{ 
						SectionLabel: "WLT", 
						SectionData: [
							`All Matches: ${seasonWins}-${seasonLosses}-${seasonTies} - ${seasonWinRate}%`,
							`Qualification Matches: ${qualWins}-${qualLosses}-0 - ${qualWinRate}%`,
							`Elimination Matches: ${elimWins}-${elimLosses}-0 - ${elimWinRate}%`
						] 
					},
					{ 
						SectionLabel: "Awards", 
						SectionData: awards > 0 
							? [`${awards} Total`, `${Math.min(awards, 1)} Judged Award${awards === 1 ? "" : "s"}`] 
							: ["0 Total"] 
					},
				],
			},
		],
	};
};

export const getMockMatchInfo = (matchKey) => {
	const idx = MOCK_MATCHES.findIndex((m) => m.Key === matchKey);
	if (idx === -1) return null;

	const match = MOCK_MATCHES[idx];
	const prevKey = idx > 0 ? MOCK_MATCHES[idx - 1].Key : null;
	const nextKey = idx < MOCK_MATCHES.length - 1 ? MOCK_MATCHES[idx + 1].Key : null;

	// Parse match name for round info
	const isQual = match.MatchName.startsWith("Q");
	const matchNum = parseInt(match.MatchName.replace(/\D/g, "")) || 1;

	return {
		MatchInstance: 1,
		MatchNumber: matchNum,
		MatchRound: isQual ? 1 : 3, // 1 = Qual, 3 = SF
		Scored: match.Scored,
		NextMatchKey: nextKey,
		PreviousMatchKey: prevKey,
		Blue: {
			Score: match.Blue.Score,
			Teams: match.Blue.TeamNumbers.map(createMatchTeam),
		},
		Red: {
			Score: match.Red.Score,
			Teams: match.Red.TeamNumbers.map(createMatchTeam),
		},
		BlueWin: match.BlueWin,
		RedWin: match.RedWin,
		Tie: match.Tie,
	};
};

// ============================================
// MOCK API RESPONSES
// ============================================

export const getMockTeamListResponse = () => ({
	Success: true,
	ErrorMessage: null,
	EventStatsLoading: false,
	Teams: MOCK_TEAMS,
	ProgramAbbreviation: "V5RC",
});

export const getMockTeamInfoResponse = (teamId) => {
	const teamInfo = getMockTeamInfo(teamId);
	return {
		Success: !!teamInfo,
		ErrorMessage: teamInfo ? null : "Team not found",
		EventStatsLoading: false,
		TeamInfo: teamInfo,
		ProgramAbbreviation: "V5RC",
	};
};

export const getMockMatchListResponse = () => ({
	Success: true,
	ErrorMessage: null,
	EventStatsLoading: false,
	Matches: MOCK_MATCHES,
	ProgramAbbreviation: "V5RC",
});

export const getMockMatchInfoResponse = (matchKey) => {
	const matchInfo = getMockMatchInfo(matchKey);
	return {
		Success: !!matchInfo,
		ErrorMessage: matchInfo ? null : "Match not found",
		EventStatsLoading: false,
		MatchInfo: matchInfo,
		ProgramAbbreviation: "V5RC",
	};
};
