import {
  Box,
  FormControl,
  Stack,
  Input,
  Flex,
  TextArea,
  Button,
  Radio,
  ScrollView,
  VStack,
  HStack,
  Checkbox,
  Text,
  IconButton,
  Icon,
} from "native-base";
import React, { useContext, useEffect } from "react";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReferenceDataContext } from "../share/ReferenceDataContext";
import { Api, ApiDefault } from "../model/api";
import { randomIntFromInterval } from "../util";

export function ApiRaw() {
  const { setData } = useContext(ReferenceDataContext);
  const [config, setConfig] = React.useState<any>({});
  const [name, setName] = React.useState("");
  const [idSelect, setIdSelect] = React.useState(0);
  const [api, setApi] = React.useState<Api>(ApiDefault);
  useEffect(() => {
    loadData();
  }, []);

  const storeData = async () => {
    try {
      const configClone: any = { ...config };
      let i: number = api.id;
      while (configClone[i] != undefined) {
        i = randomIntFromInterval(1, 100000);
      }
      configClone[i] = { ...api, name, id: i };
      setConfig(configClone);
      setApi(configClone[i]);
      setData(configClone[i]);
      setIdSelect(i);
      await AsyncStorage.setItem("configs", JSON.stringify(configClone));
      await AsyncStorage.setItem("active", i.toString());
    } catch (e) {
      // saving error
      console.log('saving error')
    }
  };

  const loadData = async () => {
    try {
      const idStr = await AsyncStorage.getItem("active");
      if (idStr != undefined && !isNaN(+idStr)) {
        let id = Number(idStr);
        const jsonValue = await AsyncStorage.getItem("configs");
        let jsonObj = jsonValue != null ? JSON.parse(jsonValue) : {};
        if (jsonObj[id] != null) {
          setApi(jsonObj[id]);
          setName(jsonObj[id].name);
          setData(jsonObj[id]);
          setIdSelect(id);
        }
      }
    } catch (e) {
      // saving error
      console.log('saving error')
    }
  };

  const loadConfig = async () => {
    if (config && config[idSelect]) {
      console.log(idSelect);
      setName(config[idSelect].name);
      setData(config[idSelect]);
      setApi(config[idSelect]);
      await AsyncStorage.setItem("active", idSelect.toString());
    }
  };

  const handleDelete = async (key: number) => {
    if (config != undefined) {
      const configClone: any = { ...config };
      delete configClone[key];
      setConfig(configClone);
      await AsyncStorage.setItem("configs", JSON.stringify(configClone));
    }
  };

  return (
    <ScrollView
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        // overflowY: "scroll",
      }}
      nestedScrollEnabled={true}
    >
      <Box bg="light.300">
        <FormControl isRequired>
          <Stack mx="4">
            <FormControl.Label>Name Config</FormControl.Label>
            <Input
              type="text"
              value={name}
              onChangeText={(value) => setName(value)}
              placeholder="text"
            />
          </Stack>
        </FormControl>
        <FormControl isRequired>
          <Stack mx="4">
            <FormControl.Label>API url</FormControl.Label>
            <Input
              type="text"
              value={api.url}
              onChangeText={(value) => setApi({ ...api, url: value })}
              placeholder="text"
            />
            <FormControl.HelperText>End without '/'</FormControl.HelperText>
          </Stack>
        </FormControl>
        <FormControl isRequired isInvalid>
          <Stack mx="4">
            <Radio.Group
              name="myRadioGroup"
              accessibilityLabel="favorite number"
              value={api.method}
              onChange={(nextValue) => {
                setApi({ ...api, method: nextValue });
              }}
            >
              <Radio value="POST" my={1}>
                POST
              </Radio>
              <Radio value="GET" my={1}>
                GET
              </Radio>
            </Radio.Group>
          </Stack>
        </FormControl>
        <FormControl isRequired>
          <Stack mx="4">
            <FormControl.Label>API audio url</FormControl.Label>
            <Input
              type="text"
              value={api.urlAudio}
              onChangeText={(value) => setApi({ ...api, urlAudio: value })}
              placeholder="text"
            />
            <FormControl.HelperText>End without '/'</FormControl.HelperText>
          </Stack>
        </FormControl>
        <FormControl isRequired>
          <Stack mx="4">
            <FormControl.Label>Query String</FormControl.Label>
            <TextArea
              h={40}
              placeholder="Text Area Placeholder"
              w={{
                base: "100%",
              }}
              value={api.queryString}
              onChangeText={(value) => setApi({ ...api, queryString: value })}
            />
          </Stack>
        </FormControl>
        <FormControl isRequired>
          <Stack mx="4">
            <FormControl.Label>Body</FormControl.Label>
            <TextArea
              h={40}
              placeholder="Text Area Placeholder"
              w={{
                base: "100%",
              }}
              value={api.body}
              onChangeText={(value) => setApi({ ...api, body: value })}
            />
          </Stack>
        </FormControl>
        <FormControl isRequired isReadOnly>
          <Stack mx="4">
            <Flex
              direction="row"
              mb="2.5"
              mt="1.5"
              _text={{
                color: "coolGray.800",
              }}
            >
              <Button onPress={() => storeData()}>Save Config</Button>
              <Button onPress={() => loadConfig()}>Load Config</Button>
            </Flex>
          </Stack>
        </FormControl>
        <VStack space={2}>
          {Object.keys(config ? config : {}).map((item, itemI) => (
            <HStack
              w="100%"
              justifyContent="space-between"
              alignItems="center"
              key={config[item].name + itemI.toString()}
            >
              <Checkbox
                isChecked={config[item].id == idSelect}
                onChange={() => setIdSelect(config[item].id)}
                value={config[item].id}
              >
                <Text
                  mx="2"
                  strikeThrough={config[item].id == idSelect}
                  _light={{
                    color: config[item].id == idSelect ? "gray.400" : "coolGray.800",
                  }}
                  _dark={{
                    color: config[item].id == idSelect ? "gray.400" : "coolGray.50",
                  }}
                >
                  {config[item].name}
                </Text>
              </Checkbox>
              <IconButton
                size="sm"
                colorScheme="trueGray"
                isDisabled={config[item].id == idSelect}
                icon={
                  <Icon
                    as={Entypo}
                    name="minus"
                    size="xs"
                    color="trueGray.400"
                  />
                }
                onPress={() =>
                  config[item].id != idSelect && handleDelete(config[item].id)
                }
              />
            </HStack>
          ))}
        </VStack>
      </Box>
    </ScrollView>
  );
}
