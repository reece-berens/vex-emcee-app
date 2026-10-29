namespace VEXEmcee {
    namespace API {
        namespace Objects {
            namespace MatchList {
                interface Base {
                    Key: string;
                    MatchName: string;
                    SortOrder: number;
                    Scored: boolean;
                    // Optional ISO date-times. The sample data sets them and the matches page shows the time when present
                    Scheduled?: string;
                    Started?: string;
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
                    TeamNumbers: string[];
                }
            }
        }
    }
}
