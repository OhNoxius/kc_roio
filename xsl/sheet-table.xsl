<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" encoding="UTF-8"/>
	<xsl:param name="sheet"/>
	<xsl:param name="input"/>
	<xsl:param name="edge"/>

	<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyzéèëêàçö'"/>
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZEEEEACO'"/>

	<!-- choose mode: auto/manual -->
	<xsl:template match="/">
		<!--<h2 class="table-heading"><xsl:value-of select="$sheet" /></h2>-->
		<table class="sheet row-border hover">
			<xsl:attribute name="id">
				<!--<xsl:text>table-</xsl:text>-->
				<xsl:value-of select="$sheet"/>
			</xsl:attribute>
			<xsl:apply-templates select="*[1]/*[name(.)=$sheet]" mode="auto"/>
		</table>
	</xsl:template>

	<!-- AUTO....................................................................................... -->
	<!-- SELECT SHEET -->
	<xsl:template match="*[1]/*" mode="auto">
		<thead>
			<xsl:apply-templates select="*[1]" mode="autoheader"/>
		</thead>
		<tbody>
			<xsl:apply-templates select="child::*[@*[contains(translate(., $smallcase, $uppercase), translate($input, $smallcase, $uppercase))] or *[contains(translate(., $smallcase, $uppercase), translate($input, $smallcase, $uppercase))]]" mode="autovalues"/>
		</tbody>
	</xsl:template>
	<!-- RUN THROUGHT ATTRIBUTES: make header -->
	<xsl:template match="*[attribute::* != ''][1]" mode="autoheader" priority="0">
		<tr>
			<xsl:apply-templates select="child::*[1]" mode="details-control-header"/>

			<xsl:choose>
				<xsl:when test="$edge = 'true'">
					<xsl:apply-templates select="attribute::*" mode="attributes-header">
						<xsl:sort select="position()" order="descending" case-order="lower-first" data-type="number"/>
					</xsl:apply-templates>
				</xsl:when>
				<xsl:otherwise>
					<xsl:apply-templates select="attribute::*" mode="attributes-header">
						<xsl:sort select="position()" order="ascending" data-type="number"/>
					</xsl:apply-templates>
				</xsl:otherwise>
			</xsl:choose>

			<xsl:apply-templates select="child::*" mode="children-header"/>
		</tr>
	</xsl:template>

	<xsl:template match="attribute::*" mode="attributes-header" priority="0">
		<xsl:variable name="nextpos" select="position()+1"/>
		<xsl:if test="not(starts-with(substring(name(.), 2), '-'))">
			<th>
				<xsl:if test="position() = 1">
					<xsl:attribute name="class">
						<xsl:text>titlecolumn</xsl:text>
					</xsl:attribute>
				</xsl:if>
				<xsl:value-of select="name(.)"/>
			</th>
		</xsl:if>
	</xsl:template>
	<xsl:template match="child::*" mode="children-header" priority="0">
		<th class="noVis">
			<xsl:value-of select="name(.)"/>
		</th>
	</xsl:template>
	<xsl:template match="child::*[1]" mode="details-control-header">
		<th class="details"><!-- details --></th> <!-- als hier "details-control" staat wordt er altijd een (+)je weergegeven -->
	</xsl:template>

	<!-- RUN THROUGHT ATTRIBUTES: fill in values -->
	<xsl:template match="child::*" mode="autovalues">
		<tr id="{@id}">
			<xsl:apply-templates select="child::*[1]" mode="details-control-values"/>
			<xsl:choose>
				<xsl:when test="$edge = 'true'">
					<xsl:apply-templates select="attribute::*" mode="attributes-values">
						<xsl:sort select="position()" order="descending" data-type="number"/>
					</xsl:apply-templates>
				</xsl:when>
				<xsl:otherwise>
					<xsl:apply-templates select="attribute::*" mode="attributes-values">
						<xsl:sort select="position()" order="ascending" data-type="number"/>
					</xsl:apply-templates>
				</xsl:otherwise>
			</xsl:choose>

			<xsl:apply-templates select="child::*" mode="children-values"/>
		</tr>
	</xsl:template>
	<xsl:template match="attribute::*" mode="attributes-values" priority="0">
		<xsl:if test="not(starts-with(substring(name(.), 2), '-'))">
			<td>
				<xsl:value-of select="."/>
				<xsl:variable name="nextpos" select="position()+1"/>
				<xsl:if test="(starts-with(substring(name(./parent::*/@*[position()=$nextpos]), 2), '-'))">
					<xsl:if test="string-length(./parent::*/@*[position()=$nextpos])">
						<span class="padleft description">
							<xsl:text> (</xsl:text>
							<xsl:value-of select="./parent::*/@*[position()=$nextpos]"/>
							<xsl:text>)</xsl:text>
						</span>
					</xsl:if>
				</xsl:if>
				<xsl:if test="(starts-with(substring(name(./parent::*/@*[position()=$nextpos]), 2), '+'))">
					<xsl:if test="string-length(./parent::*/@*[position()=$nextpos])">
						<span class="padleft description">
							<xsl:text> </xsl:text>
							<xsl:value-of select="./parent::*/@*[position()=$nextpos]"/>
						</span>
					</xsl:if>
				</xsl:if>
			</td>
		</xsl:if>
	</xsl:template>
	<xsl:template match="child::*" mode="children-values" priority="0">
		<td>
			<xsl:value-of select="."/>
		</td>
	</xsl:template>
	<xsl:template match="child::*[1]" mode="details-control-values">
		<td class="details"><!-- details --></td> <!-- add class here to find cell later in DataTables. SHOULD BE DIFFERENT THAN COLUMN HEADER! -->
	</xsl:template>

	<!-- AUTO OVERRIDE some common headers........................................................... -->
	<xsl:template match="@id" mode="attributes-header">
		<!--<xsl:attribute name="id">
			<xsl:value-of select="." />
		</xsl:attribute>-->
	</xsl:template>
	<xsl:template match="@id" mode="attributes-values">
		<!--<xsl:value-of select="." />-->
	</xsl:template>
	<!--<xsl:template match="_" mode="attributes-header">
		<th>°</th>
	</xsl:template>
	<xsl:template match="@last" mode="attributes-header">
		<th>familienaam</th>
	</xsl:template>
	<xsl:template match="@first" mode="attributes-header">
		<th>voornaam</th>
	</xsl:template>
	<xsl:template match="@begin" mode="attributes-header">
		<th>°</th>
	</xsl:template>
	<xsl:template match="@eind" mode="attributes-header">
		<th>†</th>
	</xsl:template>-->
	<xsl:template match="@DATUM | @Datum | @datum | @date | @rec_date" mode="attributes-header">
		<th class="date">
			<xsl:value-of select="name(.)"/>
		</th>
	</xsl:template>
	<xsl:template match="@musicbrainz | @wikipedia | @link | @url | @online | @web | @watch" mode="attributes-header">
		<th class="urlCol">
			<xsl:value-of select="name(.)"/>
		</th>
	</xsl:template>

	<xsl:template match="@Datum | @datum | @date | @rec_date" mode="attributes-values">
		<td>
			<xsl:call-template name="formatDate">
				<xsl:with-param name="dateTime" select="."/>
			</xsl:call-template>
		</td>
	</xsl:template>

	<xsl:template match="@Duur | @duur | @duration | @Duration" mode="attributes-values">
		<td>
			<xsl:call-template name="formatTime">
				<xsl:with-param name="dateTime" select="."/>
			</xsl:call-template>
		</td>
	</xsl:template>

	<!--<xsl:template match="@wikipedia" mode="attributes-values">
		<td>
			<xsl:choose>
				<xsl:when test="string(.) = ''">
					<a target="_blank">
						<xsl:attribute name="href">
							<xsl:text>https://en.wikipedia.org/w/index.php?search=</xsl:text>
							<xsl:value-of select="../@*[1]"/>
						</xsl:attribute>
						<xsl:text>search</xsl:text>
					</a>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="."/>
				</xsl:otherwise>
			</xsl:choose>
		</td>
	</xsl:template>
	<xsl:template match="@musicbrainz" mode="attributes-values">
		<td>
			<xsl:choose>
				<xsl:when test="string(.) = ''">
					<a target="_blank">
						<xsl:attribute name="href">
							<xsl:text>https://musicbrainz.org/search?query=</xsl:text>
							<xsl:value-of select="../@*[1]"/>
						</xsl:attribute>
						<xsl:text>search</xsl:text>
					</a>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="."/>
				</xsl:otherwise>
			</xsl:choose>
		</td>
	</xsl:template>-->


	<!-- HULP TEMPLATES -->
	<xsl:template match="@aka">
		<xsl:text> (</xsl:text>
		<xsl:value-of select="."/>
		<xsl:text>)</xsl:text>
	</xsl:template>
	<xsl:template match="@zip">
		<xsl:value-of select="."/>
		<xsl:text/>
	</xsl:template>
	<xsl:template match="@begin">
		<xsl:text> (</xsl:text>
		<xsl:value-of select="."/>
		<xsl:apply-templates select="../@eind"/>
		<xsl:text>)</xsl:text>
	</xsl:template>
	<xsl:template match="@eind">
		<xsl:text>-</xsl:text>
		<xsl:value-of select="."/>
	</xsl:template>
	<xsl:template match="@info">
		<xsl:text> (</xsl:text>
		<xsl:value-of select="."/>
		<xsl:text>)</xsl:text>
	</xsl:template>
	<xsl:template match="@mm">
		<xsl:value-of select="."/>
		<xsl:value-of select="name(.)"/>
		<xsl:text/>
	</xsl:template>
	<xsl:template match="@inch">
		<xsl:value-of select="."/>
		<xsl:text>&quot; </xsl:text>
	</xsl:template>
	<xsl:template match="@rpm">
		<xsl:value-of select="."/>
		<xsl:value-of select="name(.)"/>
		<xsl:text/>
	</xsl:template>
	<xsl:template match="@email">
		<xsl:text>&#xA;</xsl:text>
		<a href="mailto:{.}">e-mail</a>
	</xsl:template>
	<xsl:template match="@tel">
		<xsl:text>&#xA;tel:</xsl:text>
		<xsl:value-of select="."/>
	</xsl:template>
	<xsl:template match="@url">
		<a href="{.}" target="_blank">
			<img alt="+" src="css/ext.svg"/>
		</a>
	</xsl:template>

	<!-- DATE FORMATTING FUNCTIONS datum="Fri Nov 16 1945 18:00:00 GMT-0500 (EST)".......................... -->
	<xsl:template name="formatDate">
		<xsl:param name="dateTime"/>
		<xsl:choose>
			<xsl:when test="string-length($dateTime) > 15">
				<xsl:variable name="date" select="substring($dateTime, 1, 15)"/>
				<xsl:variable name="year" select="substring($date, 12)"/>
				<xsl:variable name="mon" select="substring($date, 5, 3)"/>
				<xsl:variable name="day" select="substring($date, 9, 2)"/>
				<xsl:variable name="month">
					<xsl:call-template name="rename-month">
						<xsl:with-param name="mon" select="$mon"/>
					</xsl:call-template>
				</xsl:variable>
				<xsl:value-of select="concat($year, '-', $month, '-', $day)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$dateTime"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<!-- Fri Dec 29 1899 19:01:43 GMT-0500 (EST) -->
	<xsl:template name="formatTime">
		<xsl:param name="dateTime"/>
		<xsl:choose>
			<xsl:when test="string-length($dateTime) > 15">
				<xsl:variable name="time" select="substring($dateTime, 17)"/>
				<xsl:variable name="hh" select="number(substring($time, 1, 2))-19"/>
				<xsl:variable name="mm" select="substring($time, 4, 2)"/>
				<xsl:variable name="ss" select="substring($time, 7, 2)"/>
				<xsl:value-of select="concat($hh, ':', $mm, ':', $ss)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$dateTime"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="replace-string">
		<xsl:param name="text"/>
		<xsl:param name="replace"/>
		<xsl:param name="with"/>
		<xsl:choose>
			<xsl:when test="contains($text,$replace)">
				<xsl:value-of select="substring-before($text,$replace)"/>
				<xsl:value-of select="$with"/>
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="substring-after($text,$replace)"/>
					<xsl:with-param name="replace" select="$replace"/>
					<xsl:with-param name="with" select="$with"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$text"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<!-- DIT IS LOMP -->
	<xsl:template name="rename-month">
		<xsl:param name="mon"/>
		<xsl:choose>
			<xsl:when test="$mon='Jan'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Jan'"/>
					<xsl:with-param name="with" select="'01'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Feb'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Feb'"/>
					<xsl:with-param name="with" select="'02'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Mar'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Mar'"/>
					<xsl:with-param name="with" select="'03'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Apr'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Apr'"/>
					<xsl:with-param name="with" select="'04'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='May'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'May'"/>
					<xsl:with-param name="with" select="'05'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Jun'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Jun'"/>
					<xsl:with-param name="with" select="'06'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Jul'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Jul'"/>
					<xsl:with-param name="with" select="'07'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Aug'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Aug'"/>
					<xsl:with-param name="with" select="'08'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Sep'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Sep'"/>
					<xsl:with-param name="with" select="'09'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Oct'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Oct'"/>
					<xsl:with-param name="with" select="'10'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Nov'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Nov'"/>
					<xsl:with-param name="with" select="'11'"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$mon='Dec'">
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="$mon"/>
					<xsl:with-param name="replace" select="'Dec'"/>
					<xsl:with-param name="with" select="'12'"/>
				</xsl:call-template>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

	<!-- MANUAL....................................................................................... -->
	<!-- ......VERY CUSTOM!!!!!....................................................................... -->
	<!-- ......................paste website specific templates HERE.................................. -->
	<!-- OVERRIDES previous code, watch out........................................................... -->

	<xsl:template match="@jazzinbelgium" mode="attributes-header">
		<th class="urlCol">
			<xsl:value-of select="name(.)"/>
		</th>
	</xsl:template>

	<!--<xsl:template match="@jazzinbelgium" mode="attributes-values">
		<td>
			<xsl:choose>
				<xsl:when test="string(.) = ''">
					<a target="_blank">
						<xsl:attribute name="href">
							<xsl:text>https://www.jazzinbelgium.com/search/search_string=</xsl:text>
							<xsl:value-of select="../@*[1]"/>
						</xsl:attribute>
						<xsl:text>zoek</xsl:text>
					</a>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="."/>
				</xsl:otherwise>
			</xsl:choose>
		</td>
	</xsl:template>-->
	<!-- NL WIKIPEDIA -->
	<!--<xsl:template match="@wikipedia" mode="attributes-values">
		<td>
			<xsl:choose>
				<xsl:when test="string(.) = ''">
					<a target="_blank">
						<xsl:attribute name="href">
							<xsl:text>https://nl.wikipedia.org/w/index.php?search=</xsl:text>
							<xsl:value-of select="../@*[1]"/>
						</xsl:attribute>
						<xsl:text>zoek</xsl:text>
					</a>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="."/>
				</xsl:otherwise>
			</xsl:choose>
		</td>
	</xsl:template>-->

</xsl:stylesheet>
