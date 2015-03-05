wordClasses = ["Noun", "Verb", "Adjective", "Adverb", "Personal pronoun", "Other pronoun",
    "Conjunction", "Interjection", "Preposition", "Numeral", "Phrase/Expression/Proverb", "Other"];

wordClassOptionalForms = {};
wordClassOptionalForms["Noun"] = ["Definite singular", "Indefinite pural", "Definite plural",
    "Genitive indefinite singular", "Genitive definite singular", "Genitive indefinite plural", "Genitive definite plural"];
wordClassOptionalForms["Verb"] = ["Present tense", "Past tense (preterite)", "Perfect tense (supine)", "Imperative mood",
    "Passive present tense", "Passive past tense", "Passive perfect tense", "Particip", "Perfekt particip"];
wordClassOptionalForms["Adjective"] = ["Positive <i>ett</i> ~ &lt;noun&gt;", "Positive <i>den/det/de</i> ~ &lt;noun&gt", "Positive <i>den</i> ~ &lt;masc. noun&gt",
    "Comparative <i>en/ett/den/det/de</i> ~ + &lt;noun&gt;", "Superlative <i>är ~</i>", "Def. superlative <i>den/det/de</i> ~ &lt;noun&gt;", "Def. superlative <i>den</i> ~ &lt;masc. noun&gt;"];
wordClassOptionalForms["Personal pronoun"] = ["Object form", "Possessive &lt;en-noun&gt;", "Possessive &lt;ett-noun&gt;", "Possessive &lt;plural noun&gt;"]
wordClassOptionalForms["Phrase/Expression/Proverb"] = ["Literal meaning"];
wordClassOptionalForms["Numeral"] = ["Ordinal form", "Ordinal form <i>den/det/de</i> ~ &lt;noun&gt;", "Ordinal form <i>den</i> ~ &lt;masc. noun&gt;"];

//
wordClassDictionaryFormTips = {};
wordClassDictionaryFormTips["Noun"] = "The dictionary form of a noun is the indefinite singular form. (<i>en/ett</i> ~)";
wordClassDictionaryFormTips["Verb"] = "The dictionary form of a verb is the infinitive form (<i>att</i> ~)";
wordClassDictionaryFormTips["Adjective"] = "The dictionary form of an adjective is the positive <i>en</i>-form.";
wordClassDictionaryFormTips["Personal pronoun"] = "The dictionary form of a personal pronoun is the subject form.";
wordClassDictionaryFormTips["Numeral"] = "The dictionary form of a numeral is the cardinal form.";
