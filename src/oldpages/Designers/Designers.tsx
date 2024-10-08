import React, { useState } from 'react';
import { Card, CardActions, CardContent, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 330,
  minHeight: 410,
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'scale(1.0002)',
    boxShadow: theme.shadows[8],
    border: 'none',
  },
}));

const IconContainer = styled('div')(({ theme }) => ({
  background: theme.palette.grey[200],
  borderRadius: '50%',
  padding: theme.spacing(1),
  width: 70,
  height: 70,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(4),
}));

const Title = styled(Typography)(({ theme }) => ({
  width: 160,
  height: 70,
  margin: 'auto',
  padding: theme.spacing(0.5),
  fontWeight: 'bold',
  textAlign: 'center',
}));

const Description = styled(Typography)(({ theme }) => ({
  width: 230,
  textAlign: 'center',
  margin: theme.spacing(2, 0),
}));

const StyledRouterLink = styled(RouterLink)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  textDecoration: 'underline',
  textUnderlineOffset: '4px',
  '&:hover': {
    background: theme.palette.common.black,
    color: theme.palette.common.white,
    textDecoration: 'none',
  },
}));

const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(10),
}));

const CardActionsWrapper = styled(CardActions)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(2),
}));

interface AdminItem {
  id: number;
  img: string;
  title: string;
  desc: string;
  buttonText: string;
  link: string;
}

const adminList: AdminItem[] = [
  {
    id: 2,
    img: "/assets/designer/2.png",
    title: "Build Data Pipeline",
    desc: "Select this option to transform and enrich data via UI driven approach. You will have an option to combine multiple datasets and create enriched data sets",
    buttonText: 'Build Pipeline',
    link: '/Designer/Build Data PipeLine'
  },
  {
    id: 3,
    img: "/assets/designer/5.png",
    title: "Manage Flow",
    desc: "Flows are Pipeline running in Airflow. Flows are scheduled to run using cron expression",
    buttonText: 'Manage Flow',
    link: '/Designer/Manage Flow'
  },
];

function Designers() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <Container>
      {adminList.map((item) => (
        <StyledCard key={item.id} elevation={1}>
          <IconContainer>
            <img width={40} src={item.img} alt={item.title} />
          </IconContainer>
          <CardContent>
            <Title variant="h6">
              {item.title}
            </Title>
            <Description variant="body2" color="text.secondary">
              {item.desc}
            </Description>
          </CardContent>
          <CardActionsWrapper>
            <StyledRouterLink
              to={item.link}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                backgroundColor: hoveredId === item.id ? 'black' : 'transparent',
                color: hoveredId === item.id ? 'white' : 'black',
              }}
            >
              {item.buttonText}
            </StyledRouterLink>
          </CardActionsWrapper>
        </StyledCard>
      ))}
    </Container>
  );
}

export default Designers;
