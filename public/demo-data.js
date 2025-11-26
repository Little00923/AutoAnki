// 演示数据 - 用于测试界面（无需API）
const DEMO_CARDS = {
    "analysis_summary": {
        "total_concepts_identified": 5,
        "recommended_card_distribution": {
            "basic_qa": 2,
            "cloze": 1,
            "enumeration": 1,
            "contextual_qa": 1
        },
        "key_concepts": ["光合作用定义", "光合作用输入输出", "光合作用阶段", "光反应", "暗反应"]
    },
    "cards": [
        {
            "type": "basic_qa",
            "front": "什么是光合作用？",
            "back": "光合作用是绿色植物利用光能，将二氧化碳和水转化为有机物，并释放氧气的过程。",
            "tags": ["生物学", "植物生理"],
            "enhancement_note": "可以比喻为'植物的厨房'，把阳光当燃料，CO2和水当食材，制造食物"
        },
        {
            "type": "cloze",
            "front": "光合作用中，绿色植物利用___，将___和___转化为有机物，并释放___。",
            "back": "光能、二氧化碳、水、氧气",
            "tags": ["生物学", "植物生理"]
        },
        {
            "type": "enumeration",
            "front": "光合作用包括哪两个主要阶段？",
            "back": "光反应和暗反应",
            "tags": ["生物学", "植物生理"]
        },
        {
            "type": "basic_qa",
            "front": "光反应发生在哪里？需要什么条件？",
            "back": "光反应发生在类囊体膜上，需要光能。",
            "tags": ["生物学", "光反应"]
        },
        {
            "type": "basic_qa",
            "front": "暗反应发生在哪里？需要什么物质？",
            "back": "暗反应发生在叶绿体基质中，需要光反应的产物ATP和NADPH。",
            "tags": ["生物学", "暗反应"]
        },
        {
            "type": "contextual_qa",
            "front": "为什么暗反应不需要光但仍依赖光反应？",
            "back": "因为暗反应需要光反应产生的ATP（能量）和NADPH（还原力）作为原料，所以虽然暗反应本身不需要光，但间接依赖光反应的产物。",
            "tags": ["生物学", "光合作用原理"],
            "enhancement_note": "理解能量流动：光能→ATP/NADPH→有机物中的化学能"
        }
    ]
};

// 导出供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEMO_CARDS;
}




