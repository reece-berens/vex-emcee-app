"use client";

import React, { useEffect, useState, JSX } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import api from './lib/apiClient';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function HomePage(): JSX.Element {
    const [loading, setLoading] = useState(true);
    const [programs, setPrograms] = useState<any[]>([]);
    const [program, setProgram] = useState<string | number>('');
    const [region, setRegion] = useState<string>('');
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string | number>('');
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const currentCookie = Cookies.get("VEXEmceeSession");
                if (!currentCookie) {
                    const sessionResp = await api.RegisterNewSession({});
                    if (sessionResp && sessionResp.Success) {
                        const token = (sessionResp as any).Session || (sessionResp as any).SessionToken;
                        if (token) Cookies.set('VEXEmceeSession', token);
                    }
                }
                const progResp = await api.GetProgramList({});
                if (progResp && progResp.Success && Array.isArray((progResp as any).Programs)) {
                    setPrograms((progResp as any).Programs);
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        init();
    }, []);

    const onSearch = async () => {
        setLoading(true);
        try {
            const resp = await api.GetEventList({ ProgramID: program ? Number(program) : undefined, Region: region || undefined });
            if (resp && resp.Success && Array.isArray((resp as any).Events)) {
                setEvents((resp as any).Events);
            } else setEvents([]);
        } catch (e) { console.error(e); setEvents([]); }
        setLoading(false);
    };

    const onChooseEvent = async () => {
        if (!selectedEvent) return;
        setLoading(true);
        try {
            const parsedEventID = Number.parseInt(selectedEvent.toString());
            if (!isNaN(parsedEventID)) {
                const regResp = await api.RegisterEventDivision({ EventID: parsedEventID, DivisionID: 1 });
                if (regResp && regResp.Success) router.push('/matches');
                else alert('Failed to register event/division');
            }
            
        } catch (e) { console.error(e); alert('Error registering event/division'); }
        setLoading(false);
    };

    return (
        <Container maxWidth="sm" sx={{paddingTop: 24}}>
            <Typography variant="h5" component="h1" gutterBottom>VEX Emcee</Typography>

            {loading ? (
                <Grid container justifyContent="center" sx={{ mt: 4 }}>
                    <CircularProgress />
                </Grid>
            ) : (
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <FormControl fullWidth>
                            <Select value={program} displayEmpty onChange={(e) => setProgram(e.target.value as any)}>
                                <MenuItem value="">Select Program</MenuItem>
                                {programs.map((p) => (
                                    <MenuItem key={p.ProgramID || p.ID || p.id} value={p.ProgramID || p.ID || p.id}>{p.ProgramName || p.Name || p.Label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <FormControl fullWidth>
                            <Select value={region} displayEmpty onChange={(e) => setRegion(e.target.value as string)}>
                                <MenuItem value="">Any Region</MenuItem>
                                <MenuItem value="Kansas">Kansas</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <Button variant="contained" fullWidth onClick={onSearch}>Search Events</Button>
                    </Grid>

                    <Grid item>
                        <FormControl fullWidth>
                            <Select value={selectedEvent} displayEmpty onChange={(e) => setSelectedEvent(e.target.value as any)}>
                                <MenuItem value="">Select Event</MenuItem>
                                {events.map((ev) => (
                                    <MenuItem key={ev.EventID || ev.ID || ev.id} value={ev.EventID || ev.ID || ev.id}>{ev.EventName || ev.Name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <Button variant="contained" color="primary" fullWidth onClick={onChooseEvent}>Choose Event</Button>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}
