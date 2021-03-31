import * as React from 'react'

export default {
  title: 'TestProject',
}

export const test_story_1 = () => {
  return <>This is static text from an IFrame</>
}

test_story_1.useIframe = true

export const test_story_2 = () => {
  return <>This is static text from an embedded component (No iframe).</>
}
