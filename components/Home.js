import React from 'react'

import Image from 'next/image'
//import profilePic from '../public/v'
import styles from '../styles/Home.module.scss'
import { useState, useEffect } from 'react';

import { ActionIcon, Button } from '@mantine/core'
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { FaArrowDown } from 'react-icons/fa';
import {
  BrandGithub,
  BrandTwitter,
  BrandLinkedin,
  Code,
} from 'tabler-icons-react'



function Home() {

  const handleScroll = () => {
    // Scroll to the referenced element
    const projectsElement = document.getElementById('projects');

    if (projectsElement) {
      projectsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div align="center" className={styles.home}>
      <div className={styles.homeContainer}>
        <div className={styles.textContainer}>
          <h3>Hello 👋, I am </h3>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>{'Vedanshu Joshi'}</h1>
          </motion.div>
          <h2>Software Engineer</h2>
          <div className={styles.iconContainer}>
            <a
              href="https://github.com/vedanshu7"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.iconInnerContainer}>
                <BrandGithub color='green' size={30} />
                <span>Github</span>
              </div>
            </a>
            <a
              href="https://linkedin.com/in/vedanshu-joshi-549b67ba/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.iconInnerContainer}>
                <BrandLinkedin color='#0a66c2' size={30} />
                <span>LinkedIn</span>
              </div>
            </a>
          </div>
        </div>

        {/* <div className={styles.imageContainer}>
          <Image
            className="profile-picture"
            src={profilePic}
            objectFit="contain"
            alt="Picture of the author"
            // width={500} automatically provided
            // automatically={true}
            // blurDataURL="data:..." automatically provided
            // placeholder="blur" // Optional blur-up while loading
            layout="responsive"
            priority
          />
        </div> */}



      </div>


      <FaArrowDown onClick={handleScroll} className={styles.downarrowbutton} />

    </div>

  )
}

export default Home
