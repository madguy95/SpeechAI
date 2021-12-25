import {
  Box,
  FormControl,
  Stack,
  Input,
  WarningOutlineIcon,
  Flex,
  TextArea,
  Select,
  CheckIcon,
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
import { Feather, Entypo } from "@expo/vector-icons";
import { View } from "../Themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReferenceDataContext } from "../share/ReferenceDataContext";

export function ApiRaw() {
  const { setData } = useContext(ReferenceDataContext);
  const [config, setConfig] = React.useState({});
  const [name, setName] = React.useState("");
  const [idSelect, setIdSelect] = React.useState(0);
  const [api, setApi] = React.useState({
    id: 0,
    url: "https://freetts.com/Home/PlayAudio",
    urlAudio: "https://freetts.com/audio",
    queryString: JSON.stringify({
      Language: "vi-VN",
      Voice: "vi-VN-Standard-A",
      TextMessage: "${textsearch}",
      type: 0,
    }),
    body: "",
    method: "POST",
  });
  useEffect(() => {
    loadData();
  }, []);
  const randomIntFromInterval = (min: number, max: number) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const storeData = async () => {
    try {
      const data: object = { ...config };
      let i: number = api.id;
      while (data[i] != undefined) {
        i = randomIntFromInterval(1, 100000);
      }
      data[i] = { ...api, name, id: i };
      setConfig(data);
      setApi(data[i]);
      setData(data[i]);
      setIdSelect(i);
      await AsyncStorage.setItem("configs", JSON.stringify(data));
      await AsyncStorage.setItem("active", i.toString());
    } catch (e) {
      // saving error
    }
  };

  const loadData = async () => {
    try {
      const idStr = await AsyncStorage.getItem("active");
      if (idStr != undefined && !isNaN(idStr)) {
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
    }
  };

  // const handleStatusChange = (itemI) => {
  //   config[itemI].isCompleted =
  //     config[itemI].isCompleted == undefined || !config[itemI].isCompleted
  //       ? true
  //       : false;
  // };

  const loadConfig = async () => {
    if (config && config[idSelect]) {
      console.log(idSelect);
      setName(config[idSelect].name);
      setData(config[idSelect]);
      setApi(config[idSelect]);
      await AsyncStorage.setItem("active", idSelect.toString());
    }
  };

  const handleDelete = async (itemI) => {
    if (config != undefined) {
      const configClone = { ...config };
      delete configClone[itemI];
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
        overflowY: "scroll",
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
          {/* <Select
              selectedValue={api.method}
              minWidth="200"
              accessibilityLabel="Choose Service"
              placeholder="Choose Service"
              _selectedItem={{
                bg: "teal.600",
                endIcon: <CheckIcon key={1} size="5" />,
              }}
              mt={1}
              onValueChange={(itemValue) =>
                setApi({ ...api, method: itemValue })
              }
            >
              <Select.Item key={1} label="Method POST" value="POST" />
              <Select.Item key={2} label="Method GET" value="GET" />
            </Select> */}
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
                  strikeThrough={config[item].isCompleted}
                  _light={{
                    color: item.isCompleted ? "gray.400" : "coolGray.800",
                  }}
                  _dark={{
                    color: item.isCompleted ? "gray.400" : "coolGray.50",
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
