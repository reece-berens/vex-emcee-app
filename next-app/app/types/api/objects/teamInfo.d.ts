namespace VEXEmcee {
    namespace API {
        namespace Objects {
            interface TeamInfo  {
                ID: number;
                Location: string;
                Number: string;
                TeamName: string;
                NextTeamID: number;
                PreviousTeamID: number;
                Sections: VEXEmcee.API.Objects.Display.SectionHeader[];
            }
        }
    }
}
