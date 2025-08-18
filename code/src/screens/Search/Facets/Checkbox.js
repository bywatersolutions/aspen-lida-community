import { Checkbox, HStack, Pressable, Text } from 'native-base';
import React from 'react';
import { logDebugMessage, logInfoMessage, logWarnMessage, logErrorMessage } from '../../../util/logging.js';

export default function Facet_Checkbox({ data, category, values = [], updateCheckboxFacet }) {
     const isChecked = values.includes(data.value);
     const handleChange = (newValue) => {
          logDebugMessage("Clicked on " + data.value + " isChecked is " + isChecked + " newValue is " + newValue);
          updateCheckboxFacet(category, data.value, newValue);
     };

     return (
          <HStack alignItems="center" px={3} py={4}>
               <Checkbox
                    value={data.value}
                    accessibilityLabel={data.display}
                    isChecked={isChecked}
                    onChange={(value)=>{
                       handleChange(value);
                    }}
               >
                    <Text
                         _light={{ color: 'darkText' }}
                         _dark={{ color: 'lightText' }}
                    >
                         {data.display}{data.count ? ` (${data.count})` : ''}
                    </Text>
               </Checkbox>
          </HStack>
     );
}
