namespace VEXEmcee {
    namespace API {
        namespace Objects {
            namespace MatchInfo {
                interface Base {
                    //Which number this is in an elimination round (ex. QF 1, QF 2, etc.)
                    MatchInstance: number;
                    //Which match this is (ex. Quali 1, Quali 2, Finals match number 1/2/3)
                    MatchNumber: number;
                    //Qualification, Round of 16, QF, SF, etc.
                    MatchRound: number;
                    Scored: boolean;
                    NextMatchID: number;
                    PreviousMatchID: number;
                }

                interface V5RC extends Base {
                    Blue: V5RCAlliance;
                    BlueWin: boolean;
                    Red: V5RCAlliance;
                    RedWin: boolean;
                    Tie: boolean;
                }

                interface V5RCAlliance {
                    Score: number;
                    Teams: V5RCTeam[];
                }

                interface V5RCTeam {
                    ID: number;
                    SimpleStat: string;
                    TeamLocator: string;
                    TeamName: string;
                    TeamNumber: string;
                    Stats: VEXEmcee.API.Objects.Display.SectionHeader[];
                }
            }
        }
    }
}
