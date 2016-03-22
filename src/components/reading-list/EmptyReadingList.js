import React from 'react'
import { Link } from 'react-router'

const EmptyReadingList = () => (
  <div className='reading-list-empty'>
    <h2>Your reading list is empty :(</h2>
    <p>Start by <Link to='/search'>searching for some mangas!</Link></p>
  </div>
)

export default EmptyReadingList
