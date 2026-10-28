import { View, Text } from 'react-native'
import React from 'react'

type Props = {
    title : string
    subtitle : string
    icon: string
    good: boolean
    value: number
}

const NutrimentItem = ({
title , subtitle , icon , good , value 
} : Props ) => {
    return (
        <View>
            <Text>Nutrimentitem</Text>
            <Text>{title}</Text>
            <Text>{subtitle}</Text>
            <Text>{good}</Text>
            <Text>{value}</Text>
        </View>
    )
}
export default NutrimentItem;