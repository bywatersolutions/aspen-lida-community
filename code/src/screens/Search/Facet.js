import _ from 'lodash';
import { Box, Button, Center, Checkbox, ChevronLeftIcon, Input, Pressable, View } from 'native-base';
import React from 'react';

// custom components and helper files
import { ScrollView } from 'react-native';

import { LoadingSpinner } from '../../components/loadingSpinner';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { LIBRARY } from '../../util/loadLibrary';
import { addAppliedFilter, buildParamsForUrl, removeAppliedFilter, SEARCH, searchAvailableFacets } from '../../util/search';
import { Facet_Checkbox } from './Facets/Checkbox';
import { Facet_Date } from './Facets/Date';
import { Facet_RadioGroup } from './Facets/RadioGroup';
import { Facet_Rating } from './Facets/Rating';
import { Facet_Slider } from './Facets/Slider';
import { Facet_Year } from './Facets/Year';
import { UnsavedChangesExit } from './UnsavedChanges';
import { logDebugMessage } from '../../util/logging.js';

const Facet = ({ route, navigation }) => {
     const _isMounted = React.useRef(false);
     const [isLoading, setIsLoading] = React.useState(true);
     const [title] = React.useState(route.params?.extra['label'] ?? 'Filter');
     const [facets, setFacets] = React.useState(route.params?.facets ?? []);
     const [numFacets, setNumFacets] = React.useState(0);
     const [category] = React.useState(route.params?.extra['field'] ?? '');
     const [multiSelect] = React.useState(Boolean(route.params?.extra['multiSelect']));
     const [filterByQuery, setFilterByQuery] = React.useState('');
     const [isUpdating, setIsUpdating] = React.useState(false);
     const [values, setValues] = React.useState([]);
     const [valuesDefault, setValuesDefault] = React.useState([]);
     const [language] = React.useState(route.params?.language ?? 'en');

     const preselectValues = () => {
          let newValues = [];
          const cluster = _.filter(SEARCH.pendingFilters, ['field', category]);
          _.map(cluster, function (item, index, collection) {
               const facets = item['facets'];
               if (_.size(facets) > 0) {
                    _.forEach(facets, function (value, key) {
                         if (multiSelect) {
                              newValues = _.concat(newValues, value);
                         } else {
                              newValues = value;
                         }
                    });
               }
          });
          setValues(newValues);
          setValuesDefault(newValues);
     };

     React.useEffect(() => {
          _isMounted.current = true;

          const initData = async () => {
               const data = _.filter(SEARCH.availableFacets, ['field', category]);
               if (data[0]) {
                    setFacets(data[0]['facets']);
                    setNumFacets(_.size(data[0]['facets']));
               }

               preselectValues();
               setIsLoading(false);
          };

          initData();

          return () => {
               _isMounted.current = false;
          };
     }, []);

     React.useEffect(() => {
          const routes = navigation.getState()?.routes;
          const prevRoute = routes[routes.length - 2];
          if (prevRoute) {
               navigation.setOptions({
                    headerLeft: () => (
                         <Pressable
                              mr={3}
                              onPress={() => {
                                   updateGlobal();
                                   navigation.navigate('Filters', {
                                        pendingFilters: SEARCH.pendingFilters,
                                   });
                              }}
                              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                              <ChevronLeftIcon size={5} color="primary.baseContrast" />
                         </Pressable>
                    ),
                    headerRight: () => <UnsavedChangesExit updateSearch={updateSearch} discardChanges={discardChanges} updateGlobal={updateGlobal} prevRoute="Filters" language={language} />,
               });
          } else {
               navigation.setOptions({
                    headerLeft: () => <Box />,
                    headerRight: () => <UnsavedChangesExit updateSearch={updateSearch} discardChanges={discardChanges} prevRoute="Filters" language={language} />,
               });
          }
     });

     const filterFacets = async () => {
          await searchAvailableFacets(category, title, filterByQuery, LIBRARY.url, language).then((result) => {
               if (result.success === false) {
                    setIsLoading(false);
               } else {
                    setFacets(result['facets']);
                    setNumFacets(_.size(result['facets']));
                    setIsLoading(false);
               }
          });
     };

     const searchBar = () => {
          const placeHolder = getTermFromDictionary(language, 'search') + ' ' + title;
          /* always display the search bar */
          if (numFacets >= 0) {
               return (
                    <Box safeArea={5}>
                         <Input
                              value={filterByQuery}
                              name="filterSearchBar"
                              onChangeText={(filterByQuery) => setFilterByQuery(filterByQuery)}
                              size="lg"
                              autoCorrect={false}
                              variant="outline"
                              returnKeyType="search"
                              placeholder={placeHolder}
                              _dark={{
                                   color: 'muted.50',
                                   borderColor: 'muted.50',
                              }}
                              _stack={{ style: {
                                   outlineWidth: 0,
                                   borderWidth: 1
                              } }}
                              onSubmitEditing={async () => {
                                   setIsLoading(true);
                                   await filterFacets();
                              }}
                         />
                    </Box>
               );
          } else {
               return <Box pb={5} />;
          }
     };

     const updateSearch = (resetFacetGroup = false, toFilters = false) => {
          const params = buildParamsForUrl();
          //console.log(params);
          SEARCH.hasPendingChanges = false;
          if (toFilters) {
               navigation.navigate('Filters', {
                    term: SEARCH.term,
               });
          } else {
               navigation.navigate('SearchResults', {
                    term: SEARCH.term,
                    pendingParams: params,
               });
          }
     };

     const updateCheckboxFacet = (group, value, newValue) => {
          logDebugMessage("Updating facet " + group + " with value " + value + " to " + newValue);
          logDebugMessage("Existing values are " + values);
          let newValues = values;
          if (newValue) {
               newValues = [...values, value];
          }else{
               newValues = newValues.filter(n=>n !== value)
          }
          logDebugMessage("Updated values are " + newValues);
          setValues(newValues);
          SEARCH.hasPendingChanges = true;
          updateGlobal(group, newValues);
     };

     const updateLocalValues = (group, newValues) => {
          setValues(newValues);
          logDebugMessage("Updating local values for " + group + " with values " + newValues);
          SEARCH.hasPendingChanges = true;
          updateGlobal(group, newValues);
     };

     const updateGlobal = (group, newValues) => {
          logDebugMessage("Updating global values for " + group + " with values " + newValues);
          const prevSelections = values;
          addAppliedFilter(group, newValues, multiSelect);
          if (multiSelect) {
               const difference = _.difference(prevSelections, newValues);
               if (difference) {
                    removeAppliedFilter(group, difference);
               }
          }
     };

     const discardChanges = () => {
          SEARCH.hasPendingChanges = true;
          const difference = _.difference(values, valuesDefault);
          if (difference) {
               removeAppliedFilter(category, difference);
          }
          setValues([]);
     };

     const resetCluster = () => {
          SEARCH.hasPendingChanges = true;
          removeAppliedFilter(category, values);
          setValues([]);
          updateSearch();
     };

     const actionButtons = () => {
          return (
               <Box safeArea={3} _light={{ bg: 'coolGray.50' }} _dark={{ bg: 'coolGray.700' }} shadow={1}>
                    <Center>
                         <Button.Group size="lg">
                              <Button variant="unstyled" onPress={() => resetCluster()}>
                                   {getTermFromDictionary(language, 'reset')}
                              </Button>
                              <Button
                                   isLoading={isUpdating}
                                   isLoadingText={getTermFromDictionary(language, 'updating', true)}
                                   onPress={() => {
                                        updateSearch();
                                   }}>
                                   {getTermFromDictionary(language, 'update')}
                              </Button>
                         </Button.Group>
                    </Center>
               </Box>
          );
     };

     if (isLoading) {
          return <LoadingSpinner />;
     }

     if (category === 'publishDate' || category === 'birthYear' || category === 'deathYear' || category === 'publishDateSort') {
          return (
               <View style={{ flex: 1 }}>
                    <ScrollView>
                         <Box safeArea={5}>
                              <Facet_Year category={category} updater={updateLocalValues} data={facets} language={language} />
                         </Box>
                    </ScrollView>
                    {actionButtons()}
               </View>
          );
     } else if (category === 'start_date') {
          return (
               <View style={{ flex: 1 }}>
                    <ScrollView>
                         <Box safeArea={5}>
                              <Facet_Date category={category} updater={updateLocalValues} data={facets} />
                         </Box>
                    </ScrollView>
                    {actionButtons()}
               </View>
          );
     } else if (category === 'rating_facet') {
          return (
               <View style={{ flex: 1 }}>
                    <ScrollView>
                         <Box safeArea={5}>
                              <Facet_Rating category={category} updater={updateLocalValues} data={facets} />
                         </Box>
                    </ScrollView>
                    {actionButtons()}
               </View>
          );
     } else if (category === 'lexile_score' || category === 'accelerated_reader_point_value' || category === 'accelerated_reader_reading_level') {
          return (
               <View style={{ flex: 1 }}>
                    <ScrollView>
                         <Box safeArea={5}>
                              <Facet_Slider category={category} data={facets} updater={updateLocalValues} language={language} />
                         </Box>
                    </ScrollView>
                    {actionButtons()}
               </View>
          );
     } else if (multiSelect) {
          //console.log("Showing Multi-Select facet");
          //console.log(facets);
          return (
               <View style={{ flex: 1 }}>
                    {searchBar()}
                    <ScrollView>
                         <Box safeAreaX={5}>
                              <Checkbox.Group
                                   name={category}
                                   value={values}
                                   accessibilityLabel={getTermFromDictionary(language, 'filter_by')}
                                   >
                                   {facets.map((item, index) => {
                                        return <Facet_Checkbox
                                             key={index}
                                             data={item}
                                             language={language}
                                             updateCheckboxFacet={updateCheckboxFacet}
                                             category={category}
                                             values={values}
                                             />;
                                   })}

                              </Checkbox.Group>
                         </Box>
                    </ScrollView>
                    {actionButtons()}
               </View>
          );
     } else {
          return (
               <View style={{ flex: 1 }}>
                    {searchBar()}
                    <ScrollView>
                         <Box safeAreaX={5}>
                              <Facet_RadioGroup data={facets} category={category} title={title} applied={values} updater={updateLocalValues} language={language} />
                         </Box>
                    </ScrollView>
                    {actionButtons()}
               </View>
          );
     }
};

export default Facet;
