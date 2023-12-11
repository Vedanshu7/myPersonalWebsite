import styles from '../styles/EandE.module.scss'
import { Text, Timeline } from '@mantine/core'
import { Book2, Briefcase, Building } from 'tabler-icons-react'
function EandE() {
  return (
    <div className={styles.eandeContainer}>
      <h1 className="title">Experience and Education</h1>
      <div className={styles.timelineContainer}>
        <Timeline lineWidth={3} radius="md">
          <Timeline.Item
            title="Master of Computer Sceience"
            bulletSize={50}
            bullet={<Book2 size={25} />}
            className={styles.timelineItem}
          >
            <Text color="dimmed" size="md">
              Purdue University
            </Text>
            <Text size="md" mt={4}>
              Jan 2023 - Present
            </Text>
          </Timeline.Item>
          <Timeline.Item
            title="Associate Software Engineer | Trainee Engineer"
            bulletSize={50}
            bullet={<Building size={25} />}
            className={styles.timelineItem}
          >
            <Text color="dimmed" size="md">
              Advanced Business Healthcare Solutions
            </Text>
            <Text size="md" mt={4}>
              Jan 2022 - Nov 2022
            </Text>
          </Timeline.Item>
          <Timeline.Item
            title="Trainee"
            bulletSize={50}
            bullet={<Building size={25} />}
            className={styles.timelineItem}
          >
            <Text color="dimmed" size="md">
              Advanced Business Healthcare Solutions
            </Text>
            <Text size="md" mt={4}>
              Sep 2021 - Jan 2022
            </Text>
          </Timeline.Item>
          <Timeline.Item
            title="Project Trainee"
            bulletSize={50}
            bullet={<Building size={25} />}
            className={styles.timelineItem}
          >
            <Text color="dimmed" size="md">
              Gateway Group Of Companies
            </Text>
            <Text size="md" mt={4}>
              Jan 2021 – Aug 2021
            </Text>
          </Timeline.Item>


          <Timeline.Item
            title="Software Developer Intern"
            bulletSize={50}
            bullet={<Building size={25} />}
            className={styles.timelineItem}
          >
            <Text color="dimmed" size="md">
              Navpad Infotech
            </Text>
            <Text size="md" mt={4}>
              May 2019 - Jun 2019
            </Text>
          </Timeline.Item>

          <Timeline.Item
            title="Bachelor of Technology in Information Technology"
            bulletSize={50}
            bullet={<Book2 size={25} />}
            className={styles.timelineItem}
          >
            <Text color="dimmed" size="md">
              Charusat University
            </Text>
            <Text size="md" mt={4}>
              June 2017 – June 2021
            </Text>
          </Timeline.Item>
        </Timeline>
      </div>
    </div>
  )
}

export default EandE
