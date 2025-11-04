namespace VEXEmcee {
    namespace API {
        namespace Objects {
            namespace TeamList {
                interface Base {
                    ID: number;
                    InDivision: boolean;
                    Number: string;
                    NumberSortOrder: number;
                    TeamName: string;
                }

                interface V5RC extends Base {
                    EventWLT: string;
                    QualiRank: number;
                }
            }
        }
    }
}
