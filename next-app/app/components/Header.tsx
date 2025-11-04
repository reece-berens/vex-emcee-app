"use client";

import React, { JSX } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/apiClient';

export default function Header(): JSX.Element {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();

    const open = Boolean(anchorEl);
    const handleMenu = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const onClearSession = () => {
        apiClient.clearSession();
        handleClose();
        router.push('/');
    };

    const goTo = (path: string) => {
        handleClose();
        router.push(path);
    }

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleMenu}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        VEX Emcee
                    </Typography>

                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        <MenuItem onClick={() => goTo('/matches')}>Match List</MenuItem>
                        <MenuItem onClick={() => goTo('/teams')}>Team List</MenuItem>
                        <MenuItem onClick={onClearSession}>Clear Session</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
