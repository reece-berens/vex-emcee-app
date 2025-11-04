"use client";

import React, { useEffect, useState, JSX } from 'react';
import api from '../../lib/apiClient';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import { useRouter, useParams } from 'next/navigation';

export default function MatchInfoPage(): JSX.Element {
    const params = useParams();
    const matchId = params.id as string;
    const [match, setMatch] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const load = async (id: string) => {
        setLoading(true);
        try {
            const resp = await api.GetMatchInfo({ MatchID: Number(id) } as any);
            if (resp && resp.Success && resp.MatchInfo) setMatch(resp.MatchInfo as any);
            else setMatch(null);
        } catch (e) { console.error(e); setMatch(null); }
        setLoading(false);
    }

    useEffect(() => { if (matchId) load(matchId); }, [matchId]);

    const goToMatch = (id?: number) => { if (!id) return; router.push(`/match/${id}`); }

    return (
        <Container maxWidth="sm" sx={{ pt: 2 }}>
            {loading && <Typography>Loading...</Typography>}
            {match && (
                <>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                            <IconButton onClick={() => goToMatch(match.PreviousMatchID)}><ArrowBackIcon /></IconButton>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">{match.MatchName}</Typography>
                            <Typography variant="body2">SortOrder: {match.SortOrder}</Typography>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={() => goToMatch(match.NextMatchID)}><ArrowForwardIcon /></IconButton>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {([...(match.Blue?.Teams || []), ...(match.Red?.Teams || [])]).map((team: any, idx: number) => (
                            <Grid item xs={12} key={team.ID || idx}>
                                <Typography variant="subtitle1">{team.TeamNumber} - {team.TeamName} ({team.TeamLocator || team.Locator || ''})</Typography>
                                {(team.Stats || []).map((section: any, sIdx: number) => (
                                    <Accordion key={sIdx}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ fontWeight: 'bold' }}>{section.SectionLabel}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <List>
                                                {(section.SectionDisplay || []).map((sd: any, i: number) => (
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
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Container>
    );
}
