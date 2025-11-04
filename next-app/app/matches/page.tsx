"use client";

import React, { useEffect, useState, JSX } from 'react';
import api from '../lib/apiClient';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';

export default function MatchListPage(): JSX.Element {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const resp = await api.GetMatchList({});
                if (resp && resp.Success && Array.isArray((resp as any).Matches)) {
                    const arr = (resp as any).Matches.slice().sort((a: any, b: any) => (a.SortOrder || 0) - (b.SortOrder || 0));
                    setMatches(arr);
                } else setMatches([]);
            } catch (e) { console.error(e); setMatches([]); }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <Container maxWidth="sm" sx={{ pt: 2 }}>
            <Typography variant="h6">Match List</Typography>
            {loading && <Typography>Loading...</Typography>}
            <List>
                {matches.map(m => (
                    <ListItem key={m.ID} button onClick={() => router.push(`/match/${m.ID}`)}>
                        <Paper sx={{ width: '100%', p: 1 }}>
                            <Grid container alignItems="center">
                                <Grid item xs={5}>
                                    <Typography variant="subtitle1">{(m.Blue && Array.isArray(m.Blue.TeamNumbers)) ? m.Blue.TeamNumbers.join(' / ') : 'Blue'}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography align="center">{m.Blue?.Score ?? '-'} - {m.Red?.Score ?? '-'}</Typography>
                                </Grid>
                                <Grid item xs={5}>
                                    <Typography variant="subtitle1" align="right">{(m.Red && Array.isArray(m.Red.TeamNumbers)) ? m.Red.TeamNumbers.join(' / ') : 'Red'}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}
