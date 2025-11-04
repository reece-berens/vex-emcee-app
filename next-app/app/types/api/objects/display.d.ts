namespace VEXEmcee {
    namespace API {
        namespace Objects {
            namespace Display {
                interface SectionHeader {
                    Name: string;
                    Order: number;
                    Display: SectionDisplay[];
                }

                interface SectionDisplay {
                    SectionLabel: string;
                    SectionData: string[];
                }
            }
        }
    }
}