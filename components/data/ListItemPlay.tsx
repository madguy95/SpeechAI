import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ListRenderItemInfo,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { PlaylistItem } from "../model/api";

export default function ListItemPlay(props: { data?: any; idSelected?: any; onChange?: any; }) {

    const { idSelected, onChange } = props
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState<PlaylistItem[]>([]);

    useEffect(() => {
        fetchData();
    }, [props.data])

    const fetchData = () => {
        const dataSource = props.data.map((item: { id: any; title: any; name: any; isSelect: boolean; 
            selectedClass: { paddingVertical: number; margin: number; flexDirection: "row"; 
            backgroundColor: string; justifyContent: "flex-start"; alignItems: "center"; zIndex: number; }; },
             index: any) => {
            item.id = index;
            item.title = item.name;
            item.isSelect = false;
            item.selectedClass = styles.list;
            return item;
        })
        setLoading(false)
        setDataSource(dataSource)
    };

    const FlatListItemSeparator = () => <View style={styles.line} />;

    const selectItem = (id: any) => {
        onChange(id);
    };


    const renderItem = (data: ListRenderItemInfo<PlaylistItem>) => (
        <TouchableOpacity
            style={[styles.list, data.item.id == idSelected ? styles.selected : styles.list]}
            onPress={() => selectItem(data.item.id)}
        >
            <Image
                source={{ uri: data.item.thumbnailUrl }}
                style={{ width: 40, height: 40, margin: 6 }}
            />
            <Text style={styles.lightText}>
                {" "}
                {data.item.title.charAt(0).toUpperCase() +
                    data.item.title.slice(1)}{" "}
            </Text>
        </TouchableOpacity>
    );

    return (
        loading ?
            (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="purple" />
                </View>
            ) :
            (
                <View style={styles.container}>
                    <FlatList
                        data={dataSource}
                        ItemSeparatorComponent={FlatListItemSeparator}
                        renderItem={(item) => renderItem(item)}
                        keyExtractor={(item) => item.id.toString()}
                        extraData={idSelected}
                    />
                </View>
            )
    )
}
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#192338",
        // paddingVertical: 50,
        position: "relative",
        width: '100%',
        height: '100%'
    },

    title: { fontSize: 20, color: "#fff", textAlign: "center", marginBottom: 10 },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    list: {
        paddingVertical: 5,
        margin: 3,
        flexDirection: "row",
        backgroundColor: "#192338",
        justifyContent: "flex-start",
        alignItems: "center",
        zIndex: -1,
    },

    lightText: { color: "#f7f7f7", width: DEVICE_WIDTH, paddingLeft: 15, fontSize: 12 },

    line: {
        height: 0.5,
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.5)",
    },

    icon: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        left: 290,
        zIndex: 1,
    },
    numberBox: {
        position: "absolute",
        bottom: 75,
        width: 30,
        height: 30,
        borderRadius: 15,
        left: 330,
        zIndex: 3,
        backgroundColor: "#e3e3e3",
        justifyContent: "center",
        alignItems: "center",
    },
    number: { fontSize: 14, color: "#000" },
    selected: { backgroundColor: "#FA7B5F" },
});
