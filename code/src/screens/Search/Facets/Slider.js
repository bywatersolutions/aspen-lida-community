import _ from 'lodash';
import { Box, FormControl, HStack, Input } from 'native-base';
import React from 'react';
import { ScrollView } from 'react-native';

// custom components and helper files
import { LoadingSpinner } from '../../../components/loadingSpinner';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { addAppliedFilter } from '../../../util/search';

export const Facet_Slider = ({ data, category, updater, language }) => {
     const [isLoading, setIsLoading] = React.useState(true);
     const [startValue, setStartValue] = React.useState('*');
     const [endValue, setEndValue] = React.useState('*');

     React.useEffect(() => {
          appliedStartValue();
          appliedEndValue();
          setIsLoading(false);
     }, []);

     const updateValue = (type, value) => {
          if (type === 'startValue') {
               setStartValue(value);
          } else {
               setEndValue(value);
          }
          updateFacet(type === 'startValue' ? value : startValue, type === 'endValue' ? value : endValue);
     };

     const updateFacet = (start = startValue, end = endValue) => {
          let value = '[' + start + '+TO+' + end + ']';
          if (!start && end) {
               value = '[*+TO+' + end + ']';
          } else if (start && !end) {
               value = '[' + start + '+TO+*]';
          } else if (!start && !end) {
               value = '[*+TO+*]';
          }
          addAppliedFilter(category, value, false);
          updater(category, value);
     };

     const appliedStartValue = () => {
          let value = 0.0;
          if (_.find(data, ['isApplied', true])) {
               const appliedFilterObj = _.find(data, ['isApplied', true]);
               value = appliedFilterObj['value'];
          }
          setStartValue(value);
     };

     const appliedEndValue = () => {
          let value = 5.0;
          if (_.find(data, ['isApplied', true])) {
               const appliedFilterObj = _.find(data, ['isApplied', true]);
               value = appliedFilterObj['value'];
          }
          setEndValue(value);
     };

     if (isLoading) {
          return <LoadingSpinner />;
     }

     return (
          <ScrollView>
               <Box safeArea={5}>
                    <FormControl mb={2}>
                         <HStack space={3} justifyContent="center">
                              <Input
                                   size="lg"
                                   placeholder={getTermFromDictionary(language, 'from')}
                                   accessibilityLabel={getTermFromDictionary(language, 'from')}
                                   defaultValue={startValue}
                                   value={startValue}
                                   onChangeText={(value) => {
                                        updateValue('startValue', value);
                                   }}
                                   w="50%"
                                   _dark={{
                                        color: 'muted.50',
                                        borderColor: 'muted.50',
                                   }}
                              />
                              <Input
                                   size="lg"
                                   placeholder={getTermFromDictionary(language, 'to')}
                                   accessibilityLabel={getTermFromDictionary(language, 'to')}
                                   defaultValue={endValue}
                                   value={endValue}
                                   onChangeText={(value) => {
                                        updateValue('endValue', value);
                                   }}
                                   w="50%"
                                   _dark={{
                                        color: 'muted.50',
                                        borderColor: 'muted.50',
                                   }}
                              />
                         </HStack>
                    </FormControl>
               </Box>
          </ScrollView>
     );
};