"use client";

import React, { useEffect, useState, JSX } from 'react';
import api from '../lib/apiClient';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useRouter } from 'next/navigation';

export default function TeamListPage(): JSX.Element {
    const [teams, setTeams] = useState<VEXEmcee.API.Objects.TeamList.V5RC[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const resp = await api.GetTeamList({});
                if (resp && resp.Success && Array.isArray((resp as VEXEmcee.API.Responses.GetTeamListResponse).Teams)) {
                    (resp as VEXEmcee.API.Responses.GetTeamListResponse).Teams.sort((a, b) => a.NumberSortOrder - b.NumberSortOrder);
                    setTeams((resp as any).Teams);
                }
                else setTeams([]);
            } catch (e) { console.error(e); setTeams([]); }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <Container maxWidth="sm" sx={{ pt: 2 }}>
            <Typography variant="h6">Team List</Typography>
            {loading && <Typography>Loading...</Typography>}
            <List>
                {teams.map(t => (
                    <ListItem key={t.ID} button onClick={() => router.push(`/team/${t.ID}`)}>
                        <ListItemText primary={`${t.Number} ${t.TeamName}`} secondary={`${t.EventWLT || ''} #${t.QualiRank || '-'} rank`} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}
