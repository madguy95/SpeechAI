import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ListItemPlay(props) {

    const { idSelected, onChange } = props
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        fetchData();
    }, [props.data])

    const fetchData = () => {
        const dataSource = props.data.map((item, index) => {
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

    const selectItem = (id) => {
        // data.item.isSelect = !data.item.isSelect;
        // data.item.selectedClass = data.item.isSelect
        //     ? styles.selected
        //     : styles.list;
        // const index = this.state.dataSource.findIndex(
        //     (item) => data.item.id === item.id
        // );
        // const dataSourceClone = this.state.dataSource.map((item, index2) => {
        //     if (index2 != index) {
        //         item.isSelect = false;
        //     }
        //     return item;
        // })
        // dataSourceClone[index] = data.item;
        onChange(id);
    };

    // goToStore = () =>
    //     this.props.navigation.navigate("Expenses", {
    //         selected: this.state.selected,
    //     });

    const renderItem = (data) => (
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
        // const itemNumber = this.state.dataSource.filter(
        //     (item) => item.isSelect
        // ).length;

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
                        // extraData={state}
                    />
                    {/* <View style={styles.numberBox}>
                    <Text style={styles.number}>{itemNumber}</Text>
                </View> */}
                    {/* <TouchableOpacity style={styles.icon}>
                    <View>
                        <Icon raised
                            name="shopping-cart"
                            type="font-awesome"
                            color="#e3e3e3"
                            size={30}
                            onPress={() => this.goToStore()}
                            containerStyle={{ backgroundColor: "#FA7B5F" }}
                        />
                    </View>
                </TouchableOpacity> */}
                </View>
            )
    )
}

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

    lightText: { color: "#f7f7f7", width: 200, paddingLeft: 15, fontSize: 12 },

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
