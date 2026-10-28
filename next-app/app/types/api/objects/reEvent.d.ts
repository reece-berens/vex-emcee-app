namespace VEXEmcee {
    namespace API {
        namespace Objects {
            interface REEvent {
                Divisions: REEventDivision[];
                ID: number;
                Name: string;
                SKU: string;
                StartDate: string;
            }

            interface REEventDivision {
                ID: number;
                Name: string;
            }
        }
    }
}
