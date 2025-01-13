import React from 'react';
import { Timeline, Text, ThemeIcon, Container, Grid } from '@mantine/core';
import { Book2, Building2, GraduationCap } from 'lucide-react';
import styles from '../styles/EandE.module.scss';

function EandE() {
  const educationEvents = [
    {
      title: "Master of Science, Computer Science",
      organization: "Purdue University",
      period: "Jan 2023 - Dec 2024",
      icon: <GraduationCap size={20} />
    },
    {
      title: "Bachelor of Technology, Information Technology",
      organization: "Charotar University of Science and Technology",
      period: "Jun 2017 - Jun 2021",
      icon: <GraduationCap size={20} />
    }
  ];

  const workEvents = [
    {
      title: "Software Engineer Intern",
      organization: "Causify.ai",
      period: "Jun 2024 - Dec 2024",
      icon: <Building2 size={20} />
    },
    {
      title: "Associate Software Engineer",
      organization: "Advanced Business and Health Care Solutions",
      period: "Sep 2021 - Nov 2022",
      icon: <Building2 size={20} />
    },
    {
      title: "Software Developer Intern",
      organization: "Gateway Group of Companies",
      period: "Nov 2020 - Aug 2021",
      icon: <Building2 size={20} />
    },
    {
      title: "Software Engineer",
      organization: "Navpad Infotech",
      period: "Mar 2019 - Aug 2019",
      icon: <Building2 size={20} />
    }
  ];

  const TimelineSection = ({ events, title }) => (
    <div className={styles.timelineSection}>
      <Text size="xl" weight={700} className={styles.sectionTitle}>{title}</Text>
      <br></br>
      <Timeline active={-1} bulletSize={24} lineWidth={2}>
        {events.map((event, index) => (
          <Timeline.Item
            key={index}
            bullet={
              <ThemeIcon size={32} radius="xl" color="blue">
                {event.icon}
              </ThemeIcon>
            }
            title={
              <Text size="lg" weight={500}>
                {event.title}
              </Text>
            }
            className={styles.timelineItem}
          >
            <Text color="dimmed" size="sm">
              {event.organization}
            </Text>
            <Text size="xs" mt={4}>
              {event.period}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );

  return (
    <div className={styles.eandeContainer}>
      <h1 align="center" className={styles.title} >Experience and Education</h1>
      <Container size="lg" className={styles.contentContainer}>
        <Grid gutter={48}>
          <Grid.Col span={6}>
            <TimelineSection 
              events={educationEvents} 
              title="Education"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TimelineSection 
              events={workEvents} 
              title="Work Experience"
            />
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}

export default EandE