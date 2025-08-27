import { MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';
import { HStack, Icon, Pressable, Text, VStack } from 'native-base';
import React from 'react';

import { addAppliedFilter, removeAppliedFilter, SEARCH } from '../../../util/search';

export const Facet_RadioGroup = ({ title, data, category, updater, applied }) => {
     const [isLoading, setIsLoading] = React.useState(true);
     const [value, setValue] = React.useState('');
     const [pending] = React.useState(SEARCH.pendingFilters);

     React.useEffect(() => {
          const facets = data;
          if (_.isObject(facets)) {
               const facet = _.filter(facets, 'isApplied');
               if (!_.isEmpty(facet)) {
                    setValue(facet[0]['value'] ?? '');
               }
          }
          setIsLoading(false);
     }, [data]);

     React.useEffect(() => {
          if (value !== applied) {
               console.log('prevValue', value);
               console.log('applied', applied);
          }
     }, [applied, value]);

     const updateValue = (payload) => {
          if (category !== 'sort_by') {
               console.log('payload > ', payload);
               console.log('value > ', value);
               if (payload === value) {
                    console.log('new is same as old. removing.');
                    removeAppliedFilter(category, payload);
                    setValue('');
               } else {
                    console.log('new value. adding.');
                    addAppliedFilter(category, payload, false);
                    setValue(payload);
               }
               console.log('current state value: ' + value);
          } else {
               console.log('payload > ', payload);
               console.log('value > ', value);
               if (payload === value) {
                    setValue('relevance');
               } else {
                    setValue(payload);
                    SEARCH.sortMethod = payload;
               }
               addAppliedFilter(category, payload, false);
          }
          updater(category, payload);
     };

     console.log(data);

     if (category === 'sort_by') {
          return (
               <VStack space={2}>
                    {data.map((facet, index) => (
                         <Pressable key={index} onPress={() => updateValue(facet.value)} p={0.5} py={2}>
                              {value === facet.value ? (
                                   <HStack space={3} justifyContent="flex-start" alignItems="center">
                                        <Icon as={MaterialIcons} name="radio-button-checked" size="lg" color="primary.600" />
                                        <Text _light={{ color: 'darkText' }} _dark={{ color: 'lightText' }} ml={2}>
                                             {facet.display}
                                        </Text>
                                   </HStack>
                              ) : (
                                   <HStack space={3} justifyContent="flex-start" alignItems="center">
                                        <Icon as={MaterialIcons} name="radio-button-unchecked" size="lg" color="muted.400" />
                                        <Text _light={{ color: 'darkText' }} _dark={{ color: 'lightText' }} ml={2}>
                                             {facet.display}
                                        </Text>
                                   </HStack>
                              )}
                         </Pressable>
                    ))}
               </VStack>
          );
     }

     return (
          <VStack space={2}>
               {data.map((facet, index) => (
                    <Pressable key={index} onPress={() => updateValue(facet.value)} p={0.5} py={2}>
                         {value === facet.value ? (
                              <HStack space={3} justifyContent="flex-start" alignItems="center">
                                   <Icon as={MaterialIcons} name="radio-button-checked" size="lg" color="primary.600" />
                                   <Text _light={{ color: 'darkText' }} _dark={{ color: 'lightText' }} ml={2}>
                                        {facet.display} ({facet.count})
                                   </Text>
                              </HStack>
                         ) : (
                              <HStack space={3} justifyContent="flex-start" alignItems="center">
                                   <Icon as={MaterialIcons} name="radio-button-unchecked" size="lg" color="muted.400" />
                                   <Text _light={{ color: 'darkText' }} _dark={{ color: 'lightText' }} ml={2}>
                                        {facet.display} ({facet.count})
                                   </Text>
                              </HStack>
                         )}
                    </Pressable>
               ))}
          </VStack>
     );
};