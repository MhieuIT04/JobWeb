// src/components/JobCardSkeleton.jsx

import React from 'react';
import { Grid, Card, CardContent, Skeleton, Box, CardActions } from '@mui/material';

const JobCardSkeleton = () => {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                        {/* Skeleton cho Avatar Logo */}
                        <Skeleton variant="rounded" width={56} height={56} />
                        
                        <Box sx={{ width: '100%' }}>
                            {/* Skeleton cho Title */}
                            <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} width="80%" />
                            {/* Skeleton cho Company Name */}
                            <Skeleton variant="text" width="60%" />
                        </Box>
                    </Box>

                    {/* Skeleton cho Location */}
                    <Skeleton variant="text" width="40%" />
                    {/* Skeleton cho Salary */}
                    <Skeleton variant="text" width="70%" />
                </CardContent>

                <CardActions>
                    {/* Skeleton cho Button */}
                    <Skeleton variant="rounded" width={90} height={30} />
                    {/* Skeleton cho IconButton */}
                    <Skeleton variant="circular" width={32} height={32} sx={{ marginLeft: 'auto' }}/>
                </CardActions>
            </Card>
        </Grid>
    );
};

export default JobCardSkeleton;