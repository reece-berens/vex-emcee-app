"use client";

import React, { useEffect, useState, JSX } from 'react';
import api from '../../lib/apiClient';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useRouter, useParams } from 'next/navigation';

export default function TeamInfoPage(): JSX.Element {
    const params = useParams();
    const teamId = params.id as string;
    const [team, setTeam] = useState<VEXEmcee.API.Objects.TeamInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const load = async (id: string) => {
            setLoading(true);
            try {
                const resp = await api.GetTeamInfo({ TeamID: Number(id) } as any);
                if (resp && resp.Success && resp.TeamInfo) setTeam(resp.TeamInfo as any);
                else setTeam(null);
            } catch (e) { console.error(e); setTeam(null); }
            setLoading(false);
        }
        if (teamId) load(teamId);
    }, [teamId]);

    const goTeam = (id?: number) => { if (!id) return; router.push(`/team/${id}`); }

    return (
        <Container maxWidth="sm" sx={{ pt: 2 }}>
            {loading && <Typography>Loading...</Typography>}
            {team && (
                <>
                    <Typography variant="h5">{team.Number} - {team.TeamName}</Typography>
                    <Typography variant="subtitle1">{team.Location}</Typography>
                    <Typography sx={{ mt: 1 }}>Navigate: <button onClick={() => goTeam(team.PreviousTeamID)}>&lt; Prev</button> <button onClick={() => goTeam(team.NextTeamID)}>Next &gt;</button></Typography>

                    {(team.Sections || []).map((section, sIdx: number) => (
                        <Accordion key={sIdx}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 'bold' }}>{section.Name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {(section.Display || []).map((sd: any, i: number) => (
                                        <ListItem key={i}>
                                            <div>
                                                <Typography sx={{ fontWeight: 'bold' }}>{sd.SectionLabel}</Typography>
                                                <ul>
                                                    {(sd.SectionData || []).map((d: string, di: number) => (<li key={di}>{d}</li>))}
                                                </ul>
                                            </div>
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </>
            )}
        </Container>
    );
}
