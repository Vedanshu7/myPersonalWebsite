import styles from '../styles/Technology.module.scss'

import Image from 'next/image'
import { Card, Center } from '@mantine/core'

import { technologyList } from './customValues.js'
function Technology() {
  return (
    <div className={styles.technologyContainer}>
      <h1 className="title">Technologies and Tools I&apos;ve Worked With</h1>

      <div className={styles.technologyCardContainer}>
        {technologyList.map((tech, index) => (
          <Card className={styles.technologyCard} shadow="sm" key={index}>
            <Card.Section>
              <Image
                src={tech.icon}
                width={75}
                height={75}
                // width={'100%'}
                //   width={'100%'}
                //   height={120}
                objectFit="fit"
                alt="Project Img"
                layout="fixed"
              />
              <h5 align="center">{tech.name}</h5>
            </Card.Section>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Technology
